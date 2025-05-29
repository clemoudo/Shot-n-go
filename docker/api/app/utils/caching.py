import hashlib
import json
from functools import wraps
from typing import Callable, Any, Coroutine
from firebase_admin import auth
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.redis_client import redis
from app.models.database import ComShot, Commande

# Type hint pour la fonction décorée
DecoratedCallable = Callable[..., Coroutine[Any, Any, Any]]

def cache_response_with_etag( # Nom changé pour refléter le nouveau comportement
    cache_key_prefix: str,
    resource_id_param: str | None = None,
    user_id_from_token_key: str | None = None,
    query_params_to_include: list[str] | None = None,
    ttl: int = 300 # Le TTL s'appliquera quand on écrit dans le cache après un calcul
):
    """
    Décorateur pour servir depuis Redis si disponible, avec gestion des ETags.
    Si Redis contient des données pour la clé, elles sont considérées fraîches et servies.
    La fonction originale n'est appelée que si Redis est vide pour cette clé.
    """
    def decorator(func: DecoratedCallable) -> DecoratedCallable:
        @wraps(func)
        async def wrapper(request: Request, *args: Any, **kwargs: Any) -> Response:
            key_parts = [cache_key_prefix]
            user_specific_id_part = None

            if user_id_from_token_key:
                user_data = kwargs.get('user_data')
                if user_data and isinstance(user_data, dict) and user_id_from_token_key in user_data:
                    user_specific_id_part = str(user_data[user_id_from_token_key])
                    key_parts.append(user_specific_id_part)
                else:
                    print(f"Avertissement: user_id_from_token_key '{user_id_from_token_key}' fourni, mais non trouvé.")
                    # Si l'UID est crucial et manquant, on bypass le cache pour éviter de servir des données incorrectes.
                    data_to_return = await func(request=request, *args, **kwargs)
                    return JSONResponse(content=data_to_return) # Pas d'ETag géré ici

            if resource_id_param and resource_id_param in kwargs:
                key_parts.append(str(kwargs[resource_id_param]))

            if query_params_to_include:
                for q_param in sorted(query_params_to_include):
                    if q_param in request.query_params:
                        key_parts.append(f"{q_param}_{request.query_params[q_param]}")
            
            final_cache_key = ":".join(key_parts)
            cache_hash_key = f"{final_cache_key}_hash" # Pour stocker l'ETag des données dans final_cache_key

            # Tenter de récupérer les données et l'ETag associé depuis Redis
            cached_data_str = await redis.get(final_cache_key)
            cached_hash_from_redis = await redis.get(cache_hash_key) # C'est l'ETag de cached_data_str

            if isinstance(cached_data_str, bytes):
                cached_data_str = cached_data_str.decode('utf-8')
            if isinstance(cached_hash_from_redis, bytes):
                cached_hash_from_redis = cached_hash_from_redis.decode('utf-8')

            client_etag = request.headers.get("if-none-match")

            if cached_data_str and cached_hash_from_redis:
                # Des données et un ETag sont en cache Redis
                if client_etag == cached_hash_from_redis:
                    # L'ETag du client correspond à celui des données en cache Redis -> 304
                    print(f"ETag match for {final_cache_key}. Serving 304.")
                    return Response(status_code=304)
                else:
                    # L'ETag du client est différent ou absent.
                    # On sert les données du cache Redis, car on les suppose fraîches.
                    print(f"Client ETag mismatch/absent for {final_cache_key}. Serving data from Redis.")
                    try:
                        # Les données sont déjà une chaîne JSON, il faut les parser pour JSONResponse
                        content_to_serve = json.loads(cached_data_str)
                        return JSONResponse(content=content_to_serve, headers={"ETag": cached_hash_from_redis})
                    except json.JSONDecodeError:
                        # Si les données en cache sont corrompues, on force un recalcul.
                        print(f"Error decoding cached JSON for {final_cache_key}. Forcing recalculation.")
                        # Continuer pour recalculer ci-dessous
            
            # Si on arrive ici, c'est que:
            # 1. cached_data_str était vide (pas de données en cache Redis pour cette clé)
            # 2. OU cached_hash_from_redis était vide (anomalie, ETag manquant pour les données)
            # 3. OU les données en cache étaient corrompues (JSONDecodeError)

            print(f"No valid cache in Redis for {final_cache_key} or data corrupted. Calling original function.")
            # Appeler la fonction originale pour obtenir les données fraîches
            data_from_func = await func(request=request, *args, **kwargs)
            
            try:
                # Sérialiser les données obtenues de la fonction
                response_json_str = json.dumps(data_from_func)
            except TypeError as e:
                raise HTTPException(status_code=500, detail=f"Erreur de sérialisation pour le cache: {e}")

            # Calculer le nouvel ETag pour ces données fraîches
            new_response_hash = hashlib.md5(response_json_str.encode('utf-8')).hexdigest()

            # Mettre en cache les nouvelles données et leur ETag dans Redis
            await redis.set(final_cache_key, response_json_str, ex=ttl)
            await redis.set(cache_hash_key, new_response_hash, ex=ttl)
            print(f"Data for {final_cache_key} fetched, cached in Redis, and served.")

            return JSONResponse(content=data_from_func, headers={"ETag": new_response_hash})
        return wrapper
    return decorator

async def calculate_and_cache_leaderboard(db_session: AsyncSession):
    try:
        result = await db_session.execute(
            select(Commande.user_id, func.sum(ComShot.quantity).label("total_shots"))
            .join(ComShot, Commande.id == ComShot.commande_id)
            .where(Commande.state == "done")
            .group_by(Commande.user_id)
            .order_by(func.sum(ComShot.quantity).desc())
        )
        rows = result.all()
        leaderboard = []
        for user_id, total_shots in rows:
            user_name = "Inconnu"
            if user_id:
                try:
                    user_data = auth.get_user(user_id)
                    user_name = user_data.display_name or user_data.email or "Utilisateur Anonyme"
                except Exception:
                    pass # Garder "Inconnu" si l'utilisateur Firebase n'est pas trouvé
            leaderboard.append({
                "user_id": user_id,
                "user_name": user_name,
                "total_shots": float(total_shots) if total_shots is not None else 0
            })

        # Stocker dans Redis (par exemple, pour 1 heure, ou sans TTL si mis à jour par événements)
        cache_key = "leaderboard_shots"
        response_json_str = json.dumps(leaderboard)
        response_hash = hashlib.md5(response_json_str.encode('utf-8')).hexdigest()

        await redis.set(cache_key, response_json_str, ex=3600)
        await redis.set(f"{cache_key}_hash", response_hash, ex=3600)

        print("Leaderboard recalculé et mis en cache.")
        return leaderboard
    except Exception as e:
        print(f"Erreur lors du calcul et de la mise en cache du leaderboard : {e}")
        return None
    
async def calculate_and_cache_machine_queue(machine_id: int, db_session: AsyncSession):
    try:
        result = await db_session.execute(
            select(Commande)
            .where(
                Commande.machine_id == machine_id,
                Commande.state == "in progress"
            )
            .order_by(Commande.order_date)
        )
        commandes = result.scalars().all()
        queue = []
        for cmd in commandes:
            user_name = "Inconnu"
            if cmd.user_id:
                try:
                    user_data = auth.get_user(cmd.user_id)
                    user_name = user_data.display_name or user_data.email or "Utilisateur Anonyme"
                except Exception:
                    pass
            queue.append({
                "commande_id": cmd.id,
                "user_name": user_name,
                "order_date": cmd.order_date.strftime("%Y-%m-%d %H:%M:%S") if cmd.order_date else "N/A"
            })
        
        cache_key = f"machine_queue:{machine_id}"
        response_json_str = json.dumps(queue)
        response_hash = hashlib.md5(response_json_str.encode('utf-8')).hexdigest()

        await redis.set(cache_key, response_json_str, ex=3600)
        await redis.set(f"{cache_key}_hash", response_hash, ex=3600)
        print(f"File d'attente pour machine {machine_id} recalculée et mise en cache.")
        return queue
    except Exception as e:
        print(f"Erreur lors du calcul/cache de la file d'attente pour machine {machine_id}: {e}")
        return None