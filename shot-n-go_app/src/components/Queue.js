import React, { useState, useEffect } from "react";
import "../styles/Queue.css";

function Queue() {
  const [queue, setQueue] = useState([]);
  const [newUser, setNewUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 🔄 Charger la file depuis FastAPI
  const fetchQueue = async () => {
    try {
      const response = await fetch("http://54.36.181.67:8000/queue");
      const data = await response.json();
      if (data.length > 0) {
        data[0].status = "En cours...";
      }
      console.log("d" ,data)
      
      setQueue(data.User);
    } catch (error) {
      console.error("Erreur lors du chargement de la file :", error);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // rafraîchir toutes les 5s
    return () => clearInterval(interval);
  }, []);

  // ✅ Ajouter un utilisateur
  const addUser = async () => {
    const trimmedUser = newUser.trim();
    if (!trimmedUser) {
      setErrorMessage("Le nom ne peut pas être vide !");
      return;
    }

    if (queue.some(user => user.name.toLowerCase() === trimmedUser.toLowerCase())) {
      setErrorMessage("Cet utilisateur est déjà dans la file !");
      return;
    }

    try {
      const response = await fetch("http://54.36.181.67:8000/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedUser }),
      });

      if (response.ok) {
        setNewUser("");
        setErrorMessage("");
        fetchQueue();
      } else {
        setErrorMessage("Erreur lors de l'ajout !");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      setErrorMessage("Erreur de connexion !");
    }
  };

  // ✅ Servir le prochain
  const serveNext = async () => {
    try {
      const response = await fetch("http://54.36.181.67:8000/queue", {
        method: "DELETE",
      });
      if (response.ok) {
        fetchQueue();
      } else {
        console.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };
  return (
    <div className="queue-container">
      <h1>File d'attente</h1>
      <div className="queue-list">
        {(queue.length > 0) ? ( 
          queue.map((user, index) => (
            <div key={user.id || index} className={`queue-item ${index === 0 ? "active" : ""}`}>
              {index + 1}. {user.name} {user.status ? `(${user.status})` : ""}
            </div>
          ))
        ) : (
          <p className="empty-message">La file d'attente est vide.</p>
        )}
      </div>

      <div className="add-user-container">
        <input
          type="text"
          placeholder="Nom de l'utilisateur"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          className="user-input"
        />
        <button className="add-btn" onClick={addUser}>
          Ajouter
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {queue.length > 1 && (
        <button className="next-btn" onClick={serveNext}>
          Servir le suivant
        </button>
      )}

      <p className="queue-message">
        {queue.length === 0 ? "La file d'attente est vide." : "Votre shot sera servi bientôt..."}
      </p>
    </div>
  );
}

export default Queue;