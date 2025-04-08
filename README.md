# Explication de la mis en place de l'authentification dans l'app web (React)


## firebase/Firebase.js 

### Configuration de Firebase et initialisation de l'authentification

Le fichier firebase.js est responsable de la configuration de Firebase dans l'application. Il contient toutes les informations nécessaires pour connecter l'application à Firebase et initialise les services dont on a besoin, tels que l'authentification.

Il contient les données sensibles tels que la clé de la DB etc ...

- initializeApp(firebaseConfig) : Cette fonction initialise Firebase avec la configuration spécifique à ton projet (fournie dans firebaseConfig).

- getAuth(app) : Une fois Firebase initialisé, cette fonction permet d'obtenir le service d'authentification de Firebase (auth), qui est utilisé pour effectuer des actions comme l'enregistrement, la connexion, la gestion des utilisateurs, etc.

Ce fichier permet de centraliser toute la configuration Firebase, ce qui rend l'intégration avec les autres parties de l'application plus simple et modulable.

## components/login.jsx

### Composant de connexion avec Firebase Authentication

Tout d'abord .jsx signifie que cela permet d'écrire des éléments HTML ou XML.

Le fichier login.jsx est le composant qui gère l'interface de connexion de l'utilisateur. C'est ici que l'utilisateur entre ses identifiants (email et mot de passe) pour se connecter à l'application. Lors de la soumission du formulaire, ce fichier gère la logique d'authentification avec Firebase.

- Gestion des états (email, password, error) : Utilisation de React useState pour gérer les valeurs des champs du formulaire et d'éventuelles erreurs.

- signInWithEmailAndPassword(auth, email, password) : Cette fonction de Firebase permet de tenter de connecter l'utilisateur avec l'email et le mot de passe fournis. Elle renvoie un objet contenant des informations sur l'utilisateur (userCredential).

- Gestion du token : Une fois l'utilisateur connecté, on récupère un token d'authentification (user.getIdToken()), qui peut être envoyé au backend (ici à une API FastAPI) pour sécuriser les requêtes.

- Affichage des erreurs : Si la connexion échoue, un message d'erreur est affiché à l'utilisateur pour lui indiquer qu'il doit vérifier ses identifiants.

L'objectif de ce composant est donc de permettre à l'utilisateur de se connecter en toute sécurité avec Firebase et de récupérer un token d'authentification à utiliser pour accéder à des ressources protégées, comme une API.


MODIFS : 

useHistory ==> useNavigate (useHistory est obselète) permet de rediriger l'utilisateur après connexion réussie.


## context/AuthContext.js

### Contexte global d'authentification pour partager l'état de l'utilisateur dans toute l'application

Le fichier authContext.js gère l'état de l'authentification de manière centralisée dans l'application. Grâce au contexte React, tous les composants peuvent accéder à l'état de l'utilisateur sans avoir à propager manuellement les informations entre les composants.

- onAuthStateChanged(auth, (user) => {...}) : Cette fonction permet de surveiller l'état de l'utilisateur connecté. Lorsqu'un utilisateur se connecte ou se déconnecte, cette fonction est déclenchée et met à jour l'état de l'application (setUser(user)).

- AuthContext.Provider : Ce composant enveloppe toute l'application et fournit l'état de l'utilisateur via le contexte. Cela permet à tous les composants qui consomment ce contexte de savoir si l'utilisateur est connecté ou non.

- Gestion du chargement : Le composant affiche un message de "Chargement..." tant que l'état de l'utilisateur n'est pas déterminé (c'est-à-dire, tant que Firebase n'a pas fini de vérifier si l'utilisateur est connecté ou non).

L'objectif principal d'authContext.js est de permettre à tous les composants de l'application de connaître l'état d'authentification actuel de l'utilisateur sans avoir à passer cet état manuellement entre les composants, rendant l'application plus modulaire et flexible.


## Utilisation de useEffect dans login.jsx

Permet de faire en sorte que lorsqu'un utilisateur est déjà connecté, qu'il soit directement envoyé sur une autre page que la page de "login"


## components/PrivateRoute.js

Le fichier PrivateRoute.js a pour rôle de protéger certaines routes de l'application en s'assurant que l'utilisateur est authentifié avant de pouvoir accéder à des pages spécifiques. Si l'utilisateur n'est pas connecté, il est redirigé vers une page de connexion, comme celle définie dans Login.jsx. C'est une manière de contrôler l'accès à des ressources ou des pages qui ne devraient être accessibles que par les utilisateurs authentifiés.
