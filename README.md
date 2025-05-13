# API

Pour lancer l'api en local ainsi que le service de cache Redis, il faut lancer la commande `docker compose up -d` dans `docker/api/dev/`

Si vous avez fait des modifications dans l'api, il suffit de faire `docker compose up -d --build api` et le conteneur va se relancer après avoir rebuild l'image de l'api. Il faudra par la suite penser à publier votre nouvelle image sur le docker hub avec `docker build -t clemoudo/shot-n-go:api-dev-<version> .` pour la version il faut aller voir sur la page [docker hub](https://hub.docker.com/r/clemoudo/shot-n-go/tags). Il faut ensuit créer un tag `docker tag clemoudo/shot-n-go:api-dev-<version> clemoudo/shot-n-go:api-dev-latest` et pour finir push les images `docker push clemoudo/shot-n-go:api-dev-<version>` et `docker push clemoudo/shot-n-go:api-dev-latest`

> Pour push une image il faut se connecter au docker hub via `docker login -u <username>` puis entrer votre mdp. Il est possible que vous n'ayez pas les droits de push dans le repo docker hub. Dans ce cas contactez moi (Clément).
