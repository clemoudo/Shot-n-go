import { useState, useRef, useEffect } from "react";
import styles from "../Admin.module.css"; // Ou un Admin.module.css spécifique si besoin
import axios from "axios"; // Ou ton instance de service API

// Helper pour l'extension de fichier
const getFileExtension = (filename) =>
  filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1).toLowerCase();

export default function ShotManagement({ shots, fetchShots, msg, setMessage }) {
  const [newShot, setNewShot] = useState({
    name: "",
    price: "",
    image: "",
    category: ""
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchShots();
  }, [])

  const uploadImage = async () => {
    const token = localStorage.getItem("token");
    if (!file || file.length === 0) {
      setMessage("shotAdd", "Veuillez sélectionner une image.");
      return null;
    }

    const selectedFile = file[0];
    const extension = getFileExtension(selectedFile.name);
    const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setMessage("shotAdd", `Extension de fichier non autorisée: ${extension}`);
      return null;
    }
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setMessage("shotAdd", "Le fichier doit être une image valide (png, jpg, gif, webp).");
      return null;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("shotAdd", "L'image dépasse la taille maximale autorisée (5 Mo).");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await axios.post(`/api/images/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return res.data.filename;
    } catch (err) {
      console.error("Upload échoué :", err);
      setMessage("shotAdd", `Échec lors de l'envoi de l'image: ${err.response?.data?.detail || err.message}`);
      return null;
    }
  };

  const deleteImageAPI = async (filename) => { // Renommé pour éviter conflit si importé
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`/api/images/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Erreur suppression image :", err);
      // Gérer l'erreur, peut-être un message spécifique pour la suppression d'image
    }
  };

  const handleDeleteShot = async (id, image) => {
    const token = localStorage.getItem("token");
    if (!window.confirm(`Supprimer le shot "${id}" et son image "${image}" ?`)) return;
    try {
      await axios.delete(`/api/shots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await deleteImageAPI(image); // Attendre la suppression de l'image
      setMessage("shotDelete", `Shot "${id}" et image "${image}" supprimés`);
      fetchShots();
    } catch (err) {
      console.error("Erreur suppression shot :", err);
      setMessage("shotDelete", `Échec de la suppression: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleNewShotChange = (e) => {
    const { name, value } = e.target;
    setNewShot((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e) => {
    const { files } = e.target;
    setFile(files);
    if (files && files.length > 0) {
      setNewShot((prev) => ({ ...prev, image: files[0].name }));
    }
  };

  const handleNewShotSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const uploadedFilename = await uploadImage();
    if (!uploadedFilename) return;

    const formData = new FormData();
    Object.entries({ ...newShot, image: uploadedFilename })
      .forEach(([key, val]) => formData.append(key, val));

    try {
      await axios.post("/api/shots", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setMessage("shotAdd", `Shot "${newShot.name}" et image "${uploadedFilename}" ajoutés !`);
      setNewShot({ name: "", price: "", image: "", category: "" });
      if (fileInputRef.current) fileInputRef.current.value = null; // Réinitialiser le champ fichier
      fetchShots();
    } catch (err) {
      console.error("Erreur envoi shot :", err);
      setMessage("shotAdd", `Erreur lors de l'ajout du shot: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <>
      {/* Ajouter un shot */}
      <section className={`${styles.form_container} ${styles.new_form}`}>
        <form onSubmit={handleNewShotSubmit}>
          <fieldset>
            <legend>Ajouter un Shot</legend>
            <label>Nom</label>
            <input name="name" placeholder="Nom" type="text" value={newShot.name} onChange={handleNewShotChange} required />
            <label>Prix (€)</label>
            <input name="price" placeholder="Prix" type="number" min="0" max="100" step="0.01" value={newShot.price} onChange={handleNewShotChange} required />
            <label>Catégorie</label>
            <input name="category" placeholder="Catégorie" type="text" value={newShot.category} onChange={handleNewShotChange} required />
            <label>Image</label>
            <input name="file" type="file" ref={fileInputRef} onChange={handleNewImageChange} required />
            <button type="submit">Ajouter Shot</button>
            {msg.shotAdd && <p className={styles.msg}>{msg.shotAdd}</p>}
          </fieldset>
        </form>
      </section>

      {/* Supprimer un shot */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!e.target.elements.shotData.value) {
              setMessage("shotDelete", "Veuillez sélectionner un shot à supprimer.");
              return;
            }
            const { id, image } = JSON.parse(e.target.elements.shotData.value);
            handleDeleteShot(id, image);
          }}
        >
          <fieldset>
            <legend>Supprimer un Shot</legend>
            <label htmlFor="shotData">Sélectionnez un shot à supprimer</label>
            <select name="shotData" id="shotData" defaultValue="">
              <option value="" disabled>-- Choisir un shot --</option>
              {shots.map((shot) => (
                <option key={shot.id} value={JSON.stringify({ id: shot.id, image: shot.image })}>
                  {shot.id} - {shot.name}
                </option>
              ))}
            </select>
            <button type="submit">Supprimer Shot</button>
            {msg.shotDelete && <p className={styles.msg}>{msg.shotDelete}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}