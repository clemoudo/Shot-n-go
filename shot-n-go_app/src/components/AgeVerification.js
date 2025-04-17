// src/AgeVerification.jsx
import { useState, useEffect } from "react";
import "../styles/AgeVerification.css"; // Assure-toi que ce chemin est correct selon ton projet

function AgeVerification({ onConfirm }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm(true);
  };

  const handleCancel = () => {
    alert("Vous devez avoir au moins 18 ans pour continuer.");
    window.location.href = "https://www.google.com";
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="age-verification-overlay">
      <div className="age-verification-modal">
        <h2>AVEZ VOUS 18 ANS ?</h2>
        <p>Ce site contient du contenu réservé exclusivement aux adultes.</p>
        <div className="age-verification-buttons">
          <button className="yes-btn" onClick={handleConfirm}>Yes</button>
          <button className="no-btn" onClick={handleCancel}>No</button>
        </div>
        <p className="age-verification-warning">
          L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
        </p>
      </div>
    </div>
  );
}

export default AgeVerification;