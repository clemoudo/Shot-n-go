import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory(); // Utilisation de useHistory pour la redirection

  // Vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si l'utilisateur est connecté, redirige vers la page d'accueil ou autre page protégée
        history.push("/dashboard"); // Remplace "/dashboard" par la page de ton choix
      }
    });

    // Nettoyage de l'abonnement lorsque le composant est démonté
    return () => unsubscribe();
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Connexion Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupère le token
      const token = await user.getIdToken();

      // Envoie du token à ton API FastAPI
      const response = await fetch("https://ton-vps.com/api/protected", {
        method: "GET", // ou "POST" selon ton endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur côté API");
      }

      const data = await response.json();
      console.log("Réponse API FastAPI :", data);

      // Redirige vers une page après la connexion réussie
      history.push("/dashboard"); // Remplace "/dashboard" par la page de destination souhaitée

    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Échec de la connexion. Vérifie tes identifiants.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Email address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </form>

        <p className="text-center mt-4">
          New user?{" "}
          <Link to="/register" className="text-blue-500">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
