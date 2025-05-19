import React, { useState, useEffect } from "react";
import "../styles/Queue.css";

function Queue() {
  const [queue, setQueue] = useState([]);
  const [newUser, setNewUser] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // useEffect(() => {
  //   fetchQueue();
  //   const interval = setInterval(fetchQueue, 10000);
  //   return () => clearInterval(interval);
  // }, []);

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
    </div>
  );
}

export default Queue;