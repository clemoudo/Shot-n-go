import { useState, useEffect } from "react";
import styles from "../Admin.module.css";
import axios from "axios";

export default function NewsManagement({ news, fetchNews, msg, setMessage }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newsIdToDelete, setNewsIdToDelete] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);


  const handleNewNewsSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!title.trim() || !content.trim()) {
        setMessage("newsAdd", "Le titre et le contenu sont requis.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    try {
      const response = await axios.post(`/api/news`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("newsAdd", response.data.message || "News publiée.");
      setTitle("");
      setContent("");
      fetchNews();
    } catch (err) {
      console.error("Erreur publication news:", err);
      setMessage("newsAdd", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteNews = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!newsIdToDelete) {
        setMessage("newsDelete", "Veuillez sélectionner une news à supprimer.");
        return;
    }

    if (!window.confirm(`Supprimer la news #${newsIdToDelete} ?`)) return;

    try {
      const response = await axios.delete(`/api/news/${newsIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("newsDelete", response.data.message || "News supprimée.");
      setNewsIdToDelete("");
      fetchNews();
    } catch (err) {
      console.error("Erreur suppression news:", err);
      setMessage("newsDelete", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <>
      {/* Ajouter une news */}
      <section className={`${styles.form_container} ${styles.new_form}`}>
        <form onSubmit={handleNewNewsSubmit}>
          <fieldset>
            <legend>Publier une News</legend>
            <label htmlFor="newsTitle">Titre</label>
            <input
              id="newsTitle"
              name="title"
              type="text"
              placeholder="Titre de la news"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label htmlFor="newsContent">Contenu (max 512 caractères)</label>
            <textarea
              id="newsContent"
              name="content"
              placeholder="Contenu de la news..."
              rows="5"
              maxLength="512"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            <button type="submit">Publier la News</button>
            {msg.newsAdd && <p className={styles.msg}>{msg.newsAdd}</p>}
          </fieldset>
        </form>
      </section>

      {/* Supprimer une news */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form onSubmit={handleDeleteNews}>
          <fieldset>
            <legend>Supprimer une News</legend>
            <label htmlFor="newsIdSelect">News à supprimer</label>
            <select 
              id="newsIdSelect" 
              name="newsId" 
              value={newsIdToDelete}
              onChange={(e) => setNewsIdToDelete(e.target.value)}
              required
            >
              <option value="" disabled>-- Choisir une news --</option>
              {/* Assurez-vous que 'news' est un tableau avant de mapper */}
              {Array.isArray(news) && news.map((n) => (
                <option key={`n-del-${n.id}`} value={n.id}>
                  {n.id} - {n.title.substring(0, 30)}{n.title.length > 30 ? "..." : ""}
                </option>
              ))}
            </select>
            <button type="submit">Supprimer la News</button>
            {msg.newsDelete && <p className={styles.msg}>{msg.newsDelete}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}