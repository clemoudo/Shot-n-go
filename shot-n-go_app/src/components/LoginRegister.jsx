import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginRegister({ onLogin }) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isRegistering, setIsRegistering] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         let userCredential;
         if (isRegistering) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
         } else {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
         }
         onLogin(userCredential.user); // on avertit le parent
      } catch (err) {
         alert(err.message);
      }
   };

   return (
      <form onSubmit={handleSubmit}>
         <h2>{isRegistering ? "Créer un compte" : "Se connecter"}</h2>
         <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
         />
         <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
         />
         <button type="submit">{isRegistering ? "S'inscrire" : "Se connecter"}</button>
         <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: "pointer" }}>
            {isRegistering ? "Déjà un compte ? Se connecter" : "Pas encore inscrit ? Créer un compte"}
         </p>
      </form>
   );
}
