import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css'

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isRegistering, setIsRegistering] = useState(false);
   const [error, setError] = useState("");
   const navigate = useNavigate();

   // Rediriger l'utilisateur s'il est déjà connecté
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            navigate("/");
         }
      });
      return () => unsubscribe();
   }, [navigate]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      try {
         if (isRegistering) {
            await createUserWithEmailAndPassword(auth, email, password);
         } else {
            await signInWithEmailAndPassword(auth, email, password);
         }
         navigate("/");
      } catch (err) {
         setError(err.message);
      }
   };

   return (
      <div className="container">
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
            <button type="submit" className="button">
               {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
         </form>
         <p onClick={() => setIsRegistering(!isRegistering)} className="toggle">
            {isRegistering ? "Déjà un compte ? Se connecter" : "Pas encore inscrit ? Créer un compte"}
         </p>
      </div>
   );
}
