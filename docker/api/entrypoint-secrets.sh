#!/bin/bash
set -e

# Lire les secrets depuis /run/secrets
export DB_PASSWORD=$(cat /run/secrets/shotngo_mysql_password)

# Lancer l'entrée standard du conteneur MySQL (par défaut)
exec docker-entrypoint.sh "$@"
