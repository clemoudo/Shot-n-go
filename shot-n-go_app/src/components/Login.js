import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
   signInWithEmailAndPassword,
   createUserWithEmailAndPassword,
   onAuthStateChanged,
   GoogleAuthProvider,
   signInWithPopup,
   updateProfile,
   sendPasswordResetEmail,
   sendEmailVerification
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [pseudo, setPseudo] = useState("");
   const [isRegistering, setIsRegistering] = useState(false);
   const [error, setError] = useState("");
   const [info, setInfo] = useState(""); // Pour les messages d'information
   const navigate = useNavigate();

   // Gérer la redirection en fonction de l'état d'authentification et de vérification
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            if (user.emailVerified) {
               // Si l'utilisateur est connecté ET vérifié, aller à l'accueil
               // Sauf si on est déjà sur une page "non protégée" comme verify-email elle-même
               if (window.location.pathname !== "/") {
                   navigate("/");
               }
            } else {
               // Si l'utilisateur est connecté mais NON vérifié,
               // et qu'il n'est pas déjà sur la page de vérification ou de login
               if (window.location.pathname !== "/verify-email" && window.location.pathname !== "/login") {
                  navigate("/verify-email");
               }
            }
         } else {
            // Si l'utilisateur n'est pas connecté et essaie d'accéder à autre chose que login
            if (window.location.pathname !== "/login") {
                // Vous pourriez vouloir le rediriger vers /login ici,
                // mais cela dépend de votre configuration de routage globale.
                // Pour l'instant, laissons le routeur gérer les accès non authentifiés aux pages protégées.
            }
         }
      });
      return () => unsubscribe();
   }, [navigate]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setInfo("");

      try {
         if (isRegistering) {
            // Création d'un utilisateur
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Mise à jour du pseudo de l'utilisateur
            await updateProfile(user, {
               displayName: pseudo,
            });

            // Envoyer l'email de vérification
            await sendEmailVerification(user);
            setInfo("Un email de vérification a été envoyé. Veuillez consulter votre boîte de réception et cliquer sur le lien pour activer votre compte avant de vous connecter.");
            // Optionnel : Déconnecter l'utilisateur pour qu'il doive se reconnecter après vérification
            // await auth.signOut();
            navigate("/verify-email"); // Rediriger vers une page d'information/attente

         } else {
            // Connexion de l'utilisateur
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
               navigate("/");
            } else {
               setError("Veuillez vérifier votre email avant de vous connecter. Un email vous a été envoyé lors de l'inscription.");
               // Optionnel: proposer de renvoyer l'email ici ou rediriger vers /verify-email
               // Pour l'instant, on affiche l'erreur et on reste sur la page de login.
               // Mieux : rediriger vers la page de vérification
               navigate("/verify-email");
            }
         }
      } catch (err) {
         let errorMessage;
         switch (err.code) { // Firebase utilise err.code pour les erreurs spécifiques
            case "auth/invalid-credential":
            case "auth/user-not-found":
            case "auth/wrong-password":
               errorMessage = "Email ou mot de passe incorrect.";
               break;
            case "auth/email-already-in-use":
               errorMessage = "Cet email est déjà utilisé par un autre compte.";
               break;
            case "auth/weak-password":
               errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
               break;
            default:
               errorMessage = err.message;
         }
         setError(errorMessage);
      }
   };

   const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      setError("");
      setInfo("");
      try {
         const result = await signInWithPopup(auth, provider);
         const user = result.user;
         // Les comptes Google sont généralement vérifiés par défaut
         if (user.emailVerified) {
            navigate("/");
         } else {
            // Cas rare, mais gérons-le
            await sendEmailVerification(user);
            setInfo("Un email de vérification a été envoyé. Veuillez consulter votre boîte de réception.");
            navigate("/verify-email");
         }
      } catch (err) {
         setError(err.message);
      }
   };

   const handlePasswordReset = async () => {
      if (!email) {
         setError("Veuillez entrer votre email pour réinitialiser le mot de passe.");
         return;
      }
      setError("");
      setInfo("");
      try {
         await sendPasswordResetEmail(auth, email);
         setInfo("Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.");
      } catch (err) {
         setError(err.message);
      }
   };

   return (
      <div className="login-container">
         <h1>Bienvenue sur Shot'N'Go !</h1>
         {!isRegistering && <p>Veuillez vous connecter pour accéder au site.</p>}
         {isRegistering && <p>Créez votre compte pour commencer.</p>}
         <br />
         <h2>{isRegistering ? "Créer un compte" : "Se connecter"}</h2>
         <form onSubmit={handleSubmit} className="form">
            <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="input"
            />
            <input
               type="password"
               placeholder="Mot de passe"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               className="input"
            />
            {isRegistering && (
               <input
                  type="text"
                  placeholder="Pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  maxLength={16} // Correction: maxLength en camelCase
                  required
                  className="input"
               />
            )}

            {error && <p className="error">{error}</p>}
            {info && <p className="info">{info}</p>} {/* Afficher les messages d'info */}

            <button type="submit" className="button">
               {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>

            {!isRegistering && (
               <>
                  <button type="button" onClick={handleGoogleLogin} className="button" style={{ backgroundColor: "#DB4437", marginTop: "10px" }}>
                     Se connecter avec Google
                  </button>
                  <button type="button" onClick={handlePasswordReset} className="reset-password-link">
                     Mot de passe oublié ?
                  </button>
               </>
            )}
         </form>
         <p onClick={() => { setIsRegistering(!isRegistering); setError(""); setInfo(""); }} className="toggle">
            {isRegistering ? "Déjà un compte ? Se connecter" : "Pas encore inscrit ? Créer un compte"}
         </p>
      </div>
   );
}
