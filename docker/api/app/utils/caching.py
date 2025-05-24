import hashlib
import json
from functools import wraps
from typing import Callable, Any, Coroutine

from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse

from app.redis_client import redis

# Type hint pour la fonction décorée
DecoratedCallable = Callable[..., Coroutine[Any, Any, Any]]

def cache_response_with_etag(
    cache_key_prefix: str,
    resource_id_param: str | None = None,
    user_id_from_token_key: str | None = None, # Ex: "uid" pour user_data["uid"]
    query_params_to_include: list[str] | None = None,
    ttl: int = 300
):
    """
    Décorateur pour mettre en cache la réponse d'une route FastAPI et gérer les ETags.
    La fonction décorée DOIT retourner les données brutes (dict, list) à mettre en cache.
    """
    def decorator(func: DecoratedCallable) -> DecoratedCallable:
        @wraps(func)
        async def wrapper(request: Request, *args: Any, **kwargs: Any) -> Response:
            key_parts = [cache_key_prefix]

            # Extraire user_data si la fonction décorée la reçoit via Depends()
            # On suppose que si user_id_from_token_key est fourni, user_data sera dans kwargs
            user_specific_id_part = None
            if user_id_from_token_key:
                user_data = kwargs.get('user_data') # Récupérer user_data des kwargs
                if user_data and isinstance(user_data, dict) and user_id_from_token_key in user_data:
                    user_specific_id_part = str(user_data[user_id_from_token_key])
                    key_parts.append(user_specific_id_part)
                else:
                    # Si user_id_from_token_key est spécifié mais l'UID n'est pas trouvé,
                    # cela pourrait indiquer une erreur de configuration ou d'appel.
                    # On pourrait lever une exception ou logger un avertissement.
                    # Pour l'instant, on ne fait rien et la clé ne sera pas spécifique à l'utilisateur.
                    # OU on pourrait choisir de ne pas cacher du tout si l'UID manque.
                    # Pour l'instant, on continue sans cette partie spécifique à l'utilisateur.
                    print(f"Avertissement: user_id_from_token_key '{user_id_from_token_key}' fourni, mais non trouvé dans user_data ou user_data non fourni.")


            if resource_id_param and resource_id_param in kwargs:
                key_parts.append(str(kwargs[resource_id_param]))

            if query_params_to_include:
                for q_param in sorted(query_params_to_include):
                    if q_param in request.query_params:
                        key_parts.append(f"{q_param}_{request.query_params[q_param]}")
            
            final_cache_key = ":".join(key_parts)
            cache_hash_key = f"{final_cache_key}_hash"
            
            # S'assurer que la clé de cache a bien été construite avec un identifiant utilisateur si attendu
            if user_id_from_token_key and not user_specific_id_part:
                 # Si on attendait un user_id mais qu'on ne l'a pas eu, on ne cache pas pour éviter un cache global incorrect.
                 # Ou on pourrait avoir une logique pour toujours exécuter la fonction.
                 # Pour l'instant, la fonction sera exécutée sans cache si l'UID manque.
                 # Ceci est une sécurité pour éviter de servir un cache global là où un cache utilisateur est attendu.
                 print(f"Skipping cache for {final_cache_key} due to missing user-specific ID part from token.")
                 data_to_cache = await func(request=request, *args, **kwargs)
                 # On ne met pas en cache, on retourne juste la réponse.
                 # L'ETag ne sera pas géré par le cache ici.
                 return JSONResponse(content=data_to_cache)


            cached_data_str = await redis.get(final_cache_key)
            cached_hash = await redis.get(cache_hash_key)

            if isinstance(cached_data_str, bytes):
                cached_data_str = cached_data_str.decode('utf-8')
            if isinstance(cached_hash, bytes):
                cached_hash = cached_hash.decode('utf-8')

            client_etag = request.headers.get("if-none-match")

            if cached_data_str and cached_hash and client_etag == cached_hash:
                return Response(status_code=304)

            data_to_cache = await func(request=request, *args, **kwargs)
            
            try:
                response_json_str = json.dumps(data_to_cache)
            except TypeError as e:
                raise HTTPException(status_code=500, detail=f"Erreur de sérialisation pour le cache: {e}")

            response_hash = hashlib.md5(response_json_str.encode('utf-8')).hexdigest()

            await redis.set(final_cache_key, response_json_str, ex=ttl)
            await redis.set(cache_hash_key, response_hash, ex=ttl)

            return JSONResponse(content=data_to_cache, headers={"ETag": response_hash})
        return wrapper
    return decorator