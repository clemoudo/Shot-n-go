import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Ajoute GoogleAuthProvider
import { auth } from "../firebase/Firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdult, setIsAdult] = useState(false); // Nouveau state pour vérifier l'âge
  const navigate = useNavigate();

  // Vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si l'utilisateur est connecté, redirige vers la page protégée
        navigate("/leaderboard"); // Page protégée après la connexion
      }
    });

    // Nettoyage de l'abonnement lorsque le composant est démonté
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser l'erreur

    if (!isAdult) {
      setError("Vous devez confirmer que vous êtes majeur.");
      return;
    }

    try {
      // Connexion avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupère le token
      const token = await user.getIdToken();

      // Envoie du token à ton API FastAPI (si nécessaire)
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
      navigate("/leaderboard");  // Remplace "/leaderboard" par la page de destination souhaitée

    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Échec de la connexion. Vérifie tes identifiants.");
    }
  };

  // Connexion via Google
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Envoie du token à ton API FastAPI (si nécessaire)
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
      navigate("/leaderboard");  // Remplace "/leaderboard" par la page de destination souhaitée

    } catch (err) {
      console.error("Erreur de connexion Google :", err);
      setError("Échec de la connexion via Google.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdult"
              checked={isAdult}
              onChange={() => setIsAdult(!isAdult)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isAdult" className="text-sm text-gray-600">
              Je confirme être majeur
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200 mt-4"
          >
            Se connecter avec Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Nouveau ici ?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
           Inscris-toi ici
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
