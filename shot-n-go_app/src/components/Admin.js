import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../styles/Admin.css";
import axios from "axios";

export default function Admin() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [newShot, setNewShot] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    category: ""
  });

  const fileInputRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          const role = tokenResult.claims.role || "client";
          setIsAdmin(role === "admin");
          localStorage.setItem("token", tokenResult.token);
        } catch (err) {
          console.error("Erreur rôle :", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const uploadImage = async () => {
    const token = localStorage.getItem("token");
    if (!file || !token) return;

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file[0]);

      const uploadRes = await axios.post(`/images/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Image et shot ajoutés !");
      setFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload échoué :", err);
      setMessage("Erreur pendant l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (filename) => {
    const token = localStorage.getItem("token");
    if (!token || !window.confirm(`Supprimer ${filename} ?`)) return;

    try {
      await axios.delete(`/images/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Image supprimée");
    } catch (err) {
      console.error("Erreur suppression :", err);
      setMessage("Échec de la suppression");
    }
  };

  const handleDeleteShot = async (name) => {
    if (!window.confirm(`Supprimer le shot "${name}" ?`)) return;
    try {
      await axios.delete(`/api/shots/${encodeURIComponent(name)}`);
      setMessage("Shot supprimé");
    } catch (err) {
      console.error("Erreur suppression shot :", err);
      setMessage("Échec de la suppression");
    }
  };

  const handleNewShotChange = (e) => {
    const { name, value} = e.target;
    setNewShot((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewImageChange = (e) => {
    const { files } = e.target;
    setFile(files);

    const imageUrl = `http://shot-n-go.m1-1.ephec-ti.be/images/${files[0].name}`;
    setNewShot((prev) => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleNewShotSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(newShot).forEach(([key, val]) => {
      formData.append(key, val);
    })

    try {
      await axios.post("/api/shots", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      uploadImage();

      setMessage("Shot ajouté !");
      setNewShot({
        name: "",
        price: "",
        stock: "",
        image: "",
        category: ""
      });

    } catch (err) {
      console.error("Erreur envoi shot :", err);
      setMessage("Erreur lors de l'ajout du shot");
    }
  };

  if (isAdmin === null) return <p>Chargement...</p>;
  if (!isAdmin) return <p>Accès refusé : vous n'avez pas les droits administrateur.</p>;

  return (
    <div className="admin-panel">
      <h1>Panneau Admin</h1>

      {/* Ajouter un shot */}
      <section className="new-shot-form">
        <form onSubmit={handleNewShotSubmit}>
          <fieldset>
            <legend>Ajouter un Shot</legend>
            <label>Nom</label>
            <input name="name" placeholder="Nom" value={newShot.name} onChange={handleNewShotChange} required />
            <label>Prix (€)</label>
            <input name="price" placeholder="Prix" type="number" min="0" max="100" step="0.01" value={newShot.price} onChange={handleNewShotChange} required />
            <label>Stock (%)</label>
            <input name="stock" placeholder="Stock" type="number" min="0" max="1" step="0.01" value={newShot.stock} onChange={handleNewShotChange} required />
            <label>Catégorie</label>
            <input name="category" placeholder="Catégorie" value={newShot.category} onChange={handleNewShotChange} required />
            <label>Image</label>
            <input name="file" type="file" ref={fileInputRef} onChange={handleNewImageChange} required />
            <button type="submit">Ajouter Shot</button>
          </fieldset>
        </form>
      </section>

      {/* Liste des shots
      <section className="shots-list">
        <h2>Shots existants</h2>
        <div className="images-grid">
          {shots.map((shot) => (
            <div key={shot.id} className="image-card">
              <img src={`data:image/png;base64,${shot.cover}`} alt={shot.name} className="preview-image" />
              <p><strong>{shot.name}</strong></p>
              <p>{shot.category} — {shot.price}€</p>
              <p>Alcool: {shot.alcoholLevel} | Sucre: {shot.sweetness}</p>
              <button onClick={() => handleDeleteShot(shot.name)} className="delete-btn">Supprimer</button>
            </div>
          ))}
        </div>
      </section> */}

      {message && <p className="message">{message}</p>}
    </div>
  );
}
