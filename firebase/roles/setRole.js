const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Chemin vers ta clé Firebase
const serviceAccountPath = path.join(__dirname, "KEY", "firebase-key.json");

// Vérifie si le fichier existe
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Le fichier firebase-key.json n'existe pas à l'emplacement spécifié.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialisation de l'admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// UID de l'utilisateur à modifier
const uid = "S0YtLrLSU4ctLskgo81x2w7H1Ru1";

// Rôle à attribuer
const role = "admin";

admin.auth().setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Rôle "${role}" défini pour l'utilisateur avec l'UID : ${uid}`);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de la définition du rôle :", error);
  });
