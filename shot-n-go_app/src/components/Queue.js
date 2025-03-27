import React, { useState, useEffect } from "react";
import "../styles/Queue.css"; // Assure-toi d'avoir ce fichier CSS

const DEFAULT_QUEUE = [
  { id: 1, name: "Utilisateur A", status: "En cours..." },
  { id: 2, name: "Utilisateur B" },
  { id: 3, name: "Utilisateur C" },
  { id: 4, name: "Utilisateur D" },
  { id: 5, name: "Utilisateur E" }
];

function Queue() {
  const [queue, setQueue] = useState(() => {
    const savedQueue = localStorage.getItem("queue");
    return savedQueue ? JSON.parse(savedQueue) : DEFAULT_QUEUE;
  });

  const [newUser, setNewUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sauvegarde la file dans localStorage
  useEffect(() => {
    if (queue.length === 0) {
      localStorage.removeItem("queue");
    } else {
      localStorage.setItem("queue", JSON.stringify(queue));
    }
  }, [queue]);

  // Fonction pour passer au suivant
  const serveNext = () => {
    if (queue.length > 1) {
      const newQueue = queue.slice(1);
      newQueue[0] = { ...newQueue[0], status: "En cours..." };
      setQueue(newQueue);
    } else {
      setTimeout(() => setQueue([]), 10000);
    }
  };

  // Automatisation avec setTimeout
  useEffect(() => {
    if (queue.length === 1) {
      setTimeout(() => setQueue([]), 10000);
    } else if (queue.length > 1) {
      const timer = setTimeout(serveNext, 10000);
      return () => clearTimeout(timer);
    }
  }, [queue]);

  // Fonction pour ajouter un utilisateur
  const addUser = () => {
    const trimmedUser = newUser.trim();
    if (!trimmedUser) {
      setErrorMessage("Le nom ne peut pas être vide !");
      return;
    }
    if (queue.some(user => user.name.toLowerCase() === trimmedUser.toLowerCase())) {
      setErrorMessage("Cet utilisateur est déjà dans la file !");
      return;
    }

    setQueue([...queue, { id: queue.length + 1, name: trimmedUser }]);
    setNewUser("");
    setErrorMessage("");
  };

  return (
    <div className="queue-container">
      <h1>File d'attente</h1>
      <div className="queue-list">
        {queue.length > 0 ? (
          queue.map((user, index) => (
            <div key={user.id} className={`queue-item ${index === 0 ? "active" : ""}`}>
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
