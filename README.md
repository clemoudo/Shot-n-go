# API

Pour lancer l'api en local il suffit de posséder le fichier `firebase-key.json` et de lancer la commande ci-dessous à cet endroit :

```bash
$ tree ./emplacement_d_execution
./emplacement_d_execution
└── KEY
    └── firebase-key.json
```

- Pour Linux : 

```bash
docker run -d --name api -p8000:5000 -v ./KEY/firebase-key.json:/code/KEY/firebase-key.json clemoudo/shot-n-go:api-dev-latest
```
