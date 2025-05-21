#!/bin/sh

echo "Waiting for api container to respond..."

# Tentatives de ping jusqu'à ce que le service 'api' réponde
until ping -c1 api >/dev/null 2>&1; do
  echo "api not reachable yet..."
  sleep 2
done

echo "Waiting for react container to respond..."

# Tentatives de ping jusqu'à ce que le service 'react' réponde
until ping -c1 react >/dev/null 2>&1; do
  echo "react not reachable yet..."
  sleep 2
done

echo "api and react are reachable. Starting Nginx..."
exec nginx -g "daemon off;"