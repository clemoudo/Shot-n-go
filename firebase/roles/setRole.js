// Utilisation
// node setRole.js <UID> <chemin/vers/firebase-key.json> [role]
// Par défaul, c'est le role admin qui est attribué

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Récupération des arguments passés en ligne de commande
const args = process.argv.slice(2);
const [uid, keyPathArg, role = "admin"] = args;

if (!uid || !keyPathArg) {
  console.error("❌ Utilisation : node setUserRole.js <UID> <chemin/firebase-key.json> [role]");
  process.exit(1);
}

// Construction du chemin absolu vers le fichier de clé
const serviceAccountPath = path.resolve(keyPathArg);

// Vérifie si le fichier existe
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Le fichier firebase-key.json n'existe pas à l'emplacement : ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialisation de l'admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Attribution du rôle
admin.auth().setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Rôle "${role}" défini pour l'utilisateur avec l'UID : ${uid}`);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de la définition du rôle :", error);
  });
