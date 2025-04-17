# API

Pour lancer l'api en local il suffit de posséder le fichier `firebase-key.json` et de lancer cette commande au même endroit : \
`docker run -d --name api -p8000:80 -v $(pwd)/firebase-key.json:/code/app/KEY/firebase-key.json clemoudo/shot-n-go:api-0.1`.
