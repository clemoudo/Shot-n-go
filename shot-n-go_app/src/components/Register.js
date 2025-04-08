import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/Firebase"; // Assurez-vous que vous importez votre fichier Firebase

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nouveau champ pour confirmer le mot de passe
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser l'erreur

    // Vérifie que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Vérifie que le mot de passe est suffisamment sécurisé (optionnel)
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      // Création de l'utilisateur avec Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Une fois l'utilisateur créé, on peut rediriger vers la page de connexion ou tableau de bord
      navigate("/login"); // Redirection vers la page de connexion

    } catch (err) {
      console.error("Erreur d'inscription :", err);
      setError("Erreur lors de l'inscription. Vérifiez votre email ou mot de passe.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Inscription</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email address</label>
            <input
              type="email"
              placeholder="Entrez votre email"
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Mot de passe</label>
            <input
              type="password"
              placeholder="Entrez votre mot de passe"
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="Confirmez votre mot de passe"
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Connecte-toi ici
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
