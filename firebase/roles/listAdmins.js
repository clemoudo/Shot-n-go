const admin = require("firebase-admin");
const path = require("path");

// Chemin vers ta clé Firebase
const serviceAccount = require(path.join(__dirname, "KEY", "firebase-key.json"));

// Initialisation de l'admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Fonction pour lister les utilisateurs ayant le rôle 'admin'
const listAdmins = async () => {
  try {
    let pageToken = undefined; // Utiliser undefined pour démarrer la pagination
    const admins = [];

    // Boucle pour récupérer les utilisateurs par page
    do {
      const listUsersResult = await admin.auth().listUsers(1000, pageToken);

      // Récupérer les utilisateurs qui ont le rôle 'admin'
      listUsersResult.users.forEach((userRecord) => {
        if (userRecord.customClaims && userRecord.customClaims.role === 'admin') {
          admins.push(userRecord.toJSON());
        }
      });

      // Mettre à jour le pageToken pour la prochaine itération
      pageToken = listUsersResult.pageToken;
    } while (pageToken); // Continuer tant qu'il y a un token de pagination

    // Affichage des admins trouvés
    if (admins.length > 0) {
      console.log(`Nombre d'admins trouvés : ${admins.length}`);
      admins.forEach((adminUser) => {
        console.log(`UID: ${adminUser.uid}, Email: ${adminUser.email}`);
      });
    } else {
      console.log("Aucun utilisateur avec le rôle 'admin' trouvé.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
  }
};

// Exécution de la fonction pour lister les admins
listAdmins();
