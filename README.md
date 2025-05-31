# Shot N Go - Application Web Full Stack

Bienvenue sur le dépôt du projet **Shot N Go** ! Cette application web a été développée par un groupe d'étudiants en informatique. Elle permet aux utilisateurs de commander des shots depuis des machines connectées, de gérer leur portefeuille virtuel, et aux administrateurs de superviser l'ensemble du système.

## Équipe de Développement

* Lucas
* Arno
* Corentin
* Martin
* Clément

## Stack Technique

* **Frontend**: React, React Bootstrap, Axios
* **Backend**: Python (FastAPI), Uvicorn
* **Base de Données**: MariaDB
* **Cache**: Redis
* **Authentification & Notifications Email**: Firebase (Authentication, Firestore pour le déclenchement d'emails via l'extension "Trigger Email")
* **Conteneurisation**: Docker, Docker Compose
* **Reverse Proxy**: Nginx
* **Intégration Continue/Déploiement Continu (CI/CD)**: GitHub Actions

## Fonctionnalités Principales

* Authentification des utilisateurs via Firebase.
* Catalogue de shots consultable par machine.
* Prise de commandes de shots.
* Système de portefeuille virtuel (crédits).
* File d'attente des commandes par machine en temps réel.
* Classement (Leaderboard) des meilleurs consommateurs.
* Section actualités.
* Interface d'administration pour :
  * La gestion des shots (CRUD).
  * La gestion des machines (CRUD).
  * L'association des shots aux machines avec gestion des stocks.
  * La gestion des portefeuilles utilisateurs (ajout/réinitialisation de crédits).
  * Le suivi et la gestion des commandes (passage à l'état "terminé").
  * La publication d'actualités.

## Intégration Firebase

Ce projet utilise Firebase pour plusieurs fonctionnalités clés :

* **Firebase Authentication**: Pour la gestion des comptes utilisateurs (inscription, connexion, gestion de session).
* **Firebase Firestore (via extension "Trigger Email")**: Bien que non directement utilisé pour stocker les données principales de l'application (qui sont dans MariaDB), Firestore est utilisé en conjonction avec l'extension "Trigger Email" pour envoyer des emails de confirmation de commande. L'API backend écrit un document dans une collection Firestore spécifique, ce qui déclenche l'envoi d'email.

**Important**: Pour que l'application fonctionne, vous devez disposer des clés de l'api Firebase :

1. Sous forme de variables d'environnement dans le fichier `shot-n-go_app/.env`.
2. Sous forme d'objet JavaScript dans le fichier `docker/api/KEY/firebase-key.json`

**Notre application ne fonctionnera pas sans une configuration Firebase valide.**

> Il sera aussi nécessaire d'avoir le fichier `firebase-key.json` à disposition pour la gestion des rôles dans la section `firebase/roles/`.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (v18+ recommandé)
* [npm](https://www.npmjs.com/) (généralement inclus avec Node.js)
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Docker Compose](https://docs.docker.com/compose/install/)

## Installation et Lancement en Local

Suivez ces étapes pour lancer l'application Shot N Go sur votre machine locale.

### 1. Cloner le Dépôt

```bash
git clone https://github.com/clemoudo/Shot-n-go
cd clemoudo-shot-n-go
```

### 2. Configuration de Firebase

#### a. Clé de Service Firebase (Backend)

1. Récupérez le fichier de clé de service JSON du projet Firebase (auprès d'un membre de l'équipe).
2. Renommez ce fichier en `firebase-key.json`.
3. Placez ce fichier `firebase-key.json` dans le dossier `docker/api/KEY/`.
    La structure attendue est : `docker/api/KEY/firebase-key.json`.

    Ce fichier est **essentiel** pour que le backend (API FastAPI) puisse interagir avec les services Firebase (comme l'authentification des utilisateurs, la vérification des tokens et la gestion des rôles) et déclencher des actions sécurisées.

#### b. Configuration Firebase (Frontend)

1. Créez un fichier `shot-n-go_app/.env`.
2. Complétez le avec les variables d'environnement fournies par un membre de l'équipe.

    Ce fichier contient les identifiants de votre projet Firebase nécessaires pour que l'application React puisse communiquer avec Firebase Authentication (pour la connexion/inscription) et potentiellement d'autres services Firebase côté client.

#### c. (Optionnel) Définir un rôle Administrateur

Pour tester les fonctionnalités d'administration, vous devez attribuer le rôle `admin` à un utilisateur Firebase existant dans votre projet. Utilisez le script Node.js fourni :

1. Assurez-vous que votre `firebase-key.json` est bien dans `firebase/KEY/` (si vous utilisez le chemin par défaut du script) ou spécifiez le chemin correct.
2. Créez un utilisateur dans votre console Firebase si ce n'est pas déjà fait. (Par exemple : <admin@example.com>)

    > **Attention**, l'adresse email doit être valide car l'application va vous demander de la confirmer en cliquant sur le lien fourni par le mail Firebase).

3. Récupérez l'UID ou l'email de cet utilisateur.
4. Exécutez la commande suivante depuis la racine du projet :

    ```bash
    node firebase/roles/setRole.js <UID_OU_EMAIL_ADMIN> <CHEMIN/VERS/firebase-key.json> [role]
    ```

    > Par défaut, c'est le rôle "admin" qui est donné à l'utilisateur.

    Par exemple, si votre clé est dans `firebase/KEY/firebase-key.json` :

    ```bash
    node firebase/roles/setRole.js admin@example.com firebase/KEY/firebase-key.json admin
    ```

### 3. Lancer le Backend (API, Base de Données, Redis)

Le backend est géré par Docker Compose dans un environnement de développement dédié.

1. Naviguez vers le dossier de développement Docker :

    ```bash
    cd docker/dev
    ```

2. Lancez les conteneurs Docker :

    ```bash
    docker compose up -d --build
    ```

    * `-d` lance les conteneurs en mode détaché (en arrière-plan).
    * `--build` force la reconstruction des images si elles ont changé.

    Cela démarrera les services suivants :
    * `api`: Votre backend FastAPI, accessible sur `http://localhost:8000`.
    * `mariadb`: La base de données MariaDB.
    * `redis`: Le serveur Redis pour le cache.

3. Pour vérifier que l'API fonctionne, ouvrez votre navigateur ou utilisez `curl` :
    `http://localhost:8000/api/`
    Vous devriez voir `{"message":"API OK"}`.

### 4. Lancer le Frontend (Application React)

1. Ouvrez un nouveau terminal.
2. Naviguez vers le dossier de l'application React :

    ```bash
    cd ../../shot-n-go_app
    # Ou depuis la racine : cd shot-n-go_app
    ```

3. Installez les dépendances du projet React :

    ```bash
    npm install
    ```

4. Démarrez le serveur de développement React :

    ```bash
    npm start
    ```

    L'application frontend devrait s'ouvrir automatiquement dans votre navigateur à l'adresse `http://localhost:3000`.

### 5. Accéder à l'Application

* **Application Frontend**: [http://localhost:3000](http://localhost:3000)
* **API Backend (pour test direct)**: [http://localhost:8000/api/](http://localhost:8000/api/)
  * Pour accéder aux endpoints protégés de l'API (ex: via Postman), vous devrez obtenir un token JWT d'un utilisateur authentifié via Firebase et l'inclure dans l'en-tête `Authorization: Bearer <VOTRE_TOKEN_JWT>`.

### 6. Arrêter les Services

* Pour arrêter l'application React, utilisez `Ctrl+C` dans le terminal où elle s'exécute.
* Pour arrêter les conteneurs Docker du backend :
    1. Assurez-vous d'être dans le dossier `docker/dev/`.
    2. Exécutez :

        ```bash
        docker compose down
        ```

        Pour supprimer également les volumes (attention, cela effacera les données de la base de données locale) :

        ```bash
        docker compose down -v
        ```

## Structure du Projet

```bash
clemoudo-shot-n-go/
├── .github/                    # Workflows GitHub Actions (CI/CD)
│   └── workflows/
│       ├── build-push.yml      # Workflow pour build et push des images Docker en production
│       └── react-tests.yml     # Workflow pour les tests React
├── README.md                   # Ce fichier
├── LICENSE                     # Licence du projet (GNU GPL v3.0)
├── docker/                     # Configurations Docker
│   ├── build_push.sh           # Script pour builder et pusher les images Docker (utilisé par CI/CD)
│   ├── docker-compose.yml      # Fichier Docker Compose pour la production
│   ├── api/                    # Configuration du conteneur de l'API Backend (Python/FastAPI)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── app/                # Code source de l'API FastAPI
│   │   │   ├── __init__.py
│   │   │   ├── db.py           # Connexion base de données (SQLAlchemy)
│   │   │   ├── firebase.py     # Intégration Firebase Admin SDK
│   │   │   ├── main.py         # Point d'entrée de l'API FastAPI
│   │   │   ├── redis_client.py # Client Redis
│   │   │   ├── models/         # Modèles SQLAlchemy
│   │   │   │   └── database.py
│   │   │   ├── router/         # Logique des routes de l'API
│   │   │   │   ├── commande.py
│   │   │   │   ├── image.py
│   │   │   │   ├── ... (autres routers)
│   │   │   └── utils/          # Utilitaires (ex: caching)
│   │   │       └── caching.py
│   │   └── images/             # Volume Docker pour stocker les images uploadées (en prod)
│   ├── dev/                    # Configuration Docker Compose pour l'environnement de développement local
│   │   └── docker-compose.yml
│   ├── mariadb/                # Configuration du conteneur MariaDB
│   │   ├── Dockerfile
│   │   └── init.sql            # Script d'initialisation de la base de données
│   ├── proxy/                  # Configuration du conteneur Nginx (proxy inverse)
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── react -> ../shot-n-go_app # Symlink vers le dossier de l'application React (utilisé par le Dockerfile de prod)
├── firebase/                   # Scripts et configuration relatifs à Firebase
│   ├── package.json            # Dépendances Node.js pour les scripts Firebase
│   ├── package-lock.json
│   └── roles/                  # Scripts pour la gestion des rôles Firebase
│       ├── listAdmins.js
│       └── setRole.js
└── shot-n-go_app/              # Application Frontend React
    ├── Dockerfile              # Dockerfile pour builder l'image React pour la production
    ├── package.json
    ├── public/                 # Fichiers statiques publics
    └── src/                    # Code source de l'application React
        ├── firebase.js         # Configuration du client Firebase SDK pour le frontend
        ├── index.js            # Point d'entrée de l'application React
        ├── components/         # Composants React
        │   ├── App.js
        │   ├── Admin/
        │   ├── Footer/
        │   ├── ... (autres composants)
        └── utils/              # Utilitaires pour le frontend
```

## Licence

Ce projet est sous licence GNU General Public License v3.0. Voir le fichier `LICENSE` pour plus de détails.
