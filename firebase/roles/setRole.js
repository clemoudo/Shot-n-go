// Utilisation
// node setRole.js <UID_ou_Email> <chemin/vers/firebase-key.json> [role]
// Par défaut, c'est le rôle admin qui est attribué

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Récupération des arguments passés en ligne de commande
const args = process.argv.slice(2);
const [userIdentifier, keyPathArg, role = "admin"] = args; // Renommé uid en userIdentifier

if (!userIdentifier || !keyPathArg) {
  console.error("❌ Utilisation : node setRole.js <UID_ou_Email> <chemin/firebase-key.json> [role]");
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
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.warn("⚠️ L'application Firebase Admin SDK est déjà initialisée. Utilisation de l'instance existante.");
    // Vous pouvez choisir d'utiliser admin.app() si vous avez besoin de l'instance spécifique
  } else {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin SDK:", error);
    process.exit(1);
  }
}


// Fonction principale asynchrone pour gérer la logique
async function setRoleForUser() {
  let uidToSet;
  let identifierType;

  try {
    // Vérifier si l'identifiant est un email
    if (userIdentifier.includes('@')) {
      identifierType = "email";
      console.log(`ℹ️ Recherche de l'utilisateur par email : ${userIdentifier}...`);
      const userRecord = await admin.auth().getUserByEmail(userIdentifier);
      uidToSet = userRecord.uid;
      console.log(`✅ Utilisateur trouvé par email. UID : ${uidToSet}`);
    } else {
      identifierType = "UID";
      uidToSet = userIdentifier;
      // Optionnel : vérifier si l'UID existe réellement avant de tenter de définir le rôle
      // Cela peut donner un message d'erreur plus précis si l'UID est invalide.
      try {
        await admin.auth().getUser(uidToSet);
        console.log(`ℹ️ L'identifiant ${uidToSet} sera utilisé comme UID.`);
      } catch (userNotFoundError) {
        if (userNotFoundError.code === 'auth/user-not-found') {
          console.error(`❌ Aucun utilisateur trouvé avec l'UID : ${uidToSet}`);
        } else {
          console.error(`❌ Erreur lors de la vérification de l'UID ${uidToSet} :`, userNotFoundError.message);
        }
        process.exit(1);
      }
    }

    // Attribution du rôle
    console.log(`ℹ️ Attribution du rôle "${role}" à l'UID ${uidToSet}...`);
    await admin.auth().setCustomUserClaims(uidToSet, { role });
    console.log(`✅ Rôle "${role}" défini pour l'utilisateur (identifié par ${identifierType}: ${userIdentifier}, UID réel: ${uidToSet}).`);

  } catch (error) {
    if (error.code === 'auth/user-not-found' && identifierType === "email") {
      console.error(`❌ Aucun utilisateur trouvé avec l'email : ${userIdentifier}`);
    } else if (error.code === 'auth/invalid-email' && identifierType === "email") {
      console.error(`❌ L'email fourni "${userIdentifier}" n'est pas valide.`);
    }
    // L'erreur 'auth/user-not-found' pour un UID est gérée ci-dessus si la vérification optionnelle est active,
    // sinon setCustomUserClaims la lèvera aussi.
    else {
      console.error(`❌ Erreur lors de la définition du rôle pour "${userIdentifier}":`, error.message);
      // console.error("Détails de l'erreur Firebase:", error); // Décommentez pour plus de détails
    }
    process.exit(1); // Quitter avec un code d'erreur
  }
}

// Exécuter la fonction principale
setRoleForUser();