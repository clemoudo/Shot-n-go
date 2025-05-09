import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { 
   signInWithEmailAndPassword, 
   createUserWithEmailAndPassword, 
   onAuthStateChanged, 
   GoogleAuthProvider, 
   signInWithPopup, 
   updateProfile,
   sendPasswordResetEmail
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [pseudo, setPseudo] = useState("");  // Nouvel état pour le pseudo
   const [isRegistering, setIsRegistering] = useState(false);
   const [error, setError] = useState("");
   const navigate = useNavigate();

   // Rediriger l'utilisateur s'il est déjà connecté
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            navigate("/");  // Rediriger vers la page d'accueil si l'utilisateur est connecté
         }
      });
      return () => unsubscribe();
   }, [navigate]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      try {
         if (isRegistering) {
            // Création d'un utilisateur
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Mise à jour du pseudo de l'utilisateur après l'inscription
            await updateProfile(user, {
               displayName: pseudo,  // Associer le pseudo à l'utilisateur
            });
         } else {
            // Connexion de l'utilisateur
            await signInWithEmailAndPassword(auth, email, password);
         }
         navigate("/");  // Rediriger vers la page d'accueil après la connexion ou l'inscription
      } catch (err) {
         setError(err.message);  // Gérer les erreurs (par exemple, email incorrect ou mot de passe erroné)
      }
   };

   const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
         await signInWithPopup(auth, provider);
         navigate("/");  // Rediriger vers la page d'accueil après la connexion avec Google
      } catch (err) {
         setError(err.message);
      }
   };

   const handlePasswordReset = async () => {
      if (!email) {
         setError("Veuillez entrer votre email pour réinitialiser le mot de passe.");
         return;
      }
   
      try {
         await sendPasswordResetEmail(auth, email);
         setError("Email de réinitialisation envoyé !");
      } catch (err) {
         setError(err.message);
      }
   };   

   return (
      <div className="login-container">
         <h2>{isRegistering ? "Créer un compte" : "Se connecter"}</h2>
         {error && <p className="error">{error}</p>}
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
                  required
                  className="input"
               />
            )}
            
            <button type="submit" className="button">
               {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>

            <button onClick={handleGoogleLogin} className="button" style={{backgroundColor: "#DB4437" }}>
               Se connecter avec Google
            </button>

            {!isRegistering && (
               <button type="button" onClick={handlePasswordReset} className="reset-password-link">
                  Mot de passe oublié ?
               </button>
            )}
         </form>
         <p onClick={() => setIsRegistering(!isRegistering)} className="toggle">
            {isRegistering ? "Déjà un compte ? Se connecter" : "Pas encore inscrit ? Créer un compte"}
         </p>
      </div>
   );
}
