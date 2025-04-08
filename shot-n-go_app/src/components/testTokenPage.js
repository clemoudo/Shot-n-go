import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getIdToken } from "firebase/auth";

function TestTokenPage() {
  const { currentUser } = useAuth();
  const [token, setToken] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  const fetchToken = async () => {
    try {
      if (!currentUser) throw new Error("Aucun utilisateur connecté");

      const token = await getIdToken(currentUser);
      setToken(token);
      console.log("Token récupéré :", token);

      // Appel de test à l'API FastAPI avec le token
      const res = await fetch("http://localhost:8000/protected_data/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Erreur inconnue");

      setApiData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [currentUser]);

  return (
    <div>
      <h2>Test du Token Firebase 🔐</h2>
      {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
      {token && (
        <div>
          <p><strong>Token Firebase (tronqué) :</strong> {token.substring(0, 60)}...</p>
        </div>
      )}
      {apiData && (
        <div>
          <h3>✅ Réponse de l'API sécurisée :</h3>
          <pre>{JSON.stringify(apiData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default TestTokenPage;
