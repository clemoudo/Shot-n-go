import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../styles/Admin.css";
import axios from "axios";

export default function Admin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(null); // null = en chargement

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true); // force refresh
          const role = tokenResult.claims.role || "client";
          setIsAdmin(role === "admin");
          localStorage.setItem("token", tokenResult.token);
        } catch (err) {
          console.error("Erreur lors de la vérification du rôle :", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (isAdmin) {
      fetchImages();
    }
  }, [isAdmin]);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`/images`);
      setImages(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des images :", err);
    }
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!file || !token) return;

    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`/images/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Image envoyée !");
      setFile(null);
      fetchImages();
    } catch (err) {
      console.error("Upload échoué :", err);
      setMessage("Erreur pendant l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    const token = localStorage.getItem("token");
    if (!token || !window.confirm(`Supprimer ${filename} ?`)) return;

    try {
      await axios.delete(`/images/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Image supprimée");
      fetchImages();
    } catch (err) {
      console.error("Erreur suppression :", err);
      setMessage("Échec de la suppression");
    }
  };

  // --- Affichage conditionnel selon le rôle ---
  if (isAdmin === null) {
    return <p>Chargement...</p>;
  }

  if (!isAdmin) {
    return <p>❌ Accès refusé : vous n'avez pas les droits administrateur.</p>;
  }

  return (
    <div className="admin-panel">
      <h1>Panneau Admin - Gestion des Images</h1>

      <div className="upload-section">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Envoi..." : "Uploader"}
        </button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="images-grid">
        {images.map((img) => (
          <div key={img} className="image-card">
            <img src={`/images/${img}`} alt={img} className="preview-image" />
            <p>{img}</p>
            <button className="delete-btn" onClick={() => handleDelete(img)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
