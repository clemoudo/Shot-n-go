import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../styles/AgeConfirmationModal.css'; 

function AgeConfirmationModal() {
  const [show, setShow] = useState(true);
  const [message, setMessage] = useState('');
  const [isAdult, setIsAdult] = useState(null); // For age verification logic

  useEffect(() => {
    // Automatically close modal after 3 seconds if adult
    if (isAdult === true) {
      setTimeout(() => setShow(false), 3000);
    }
  }, [isAdult]);

  const handleYes = () => {
    setIsAdult(true); // User is adult
    setMessage('🎉 Bienvenue, vous êtes majeur !');
  };

  const handleNo = () => {
    setIsAdult(false); // User is not adult
    setMessage("⛔ Accès refusé. Vous devez être majeur pour continuer.");
  };

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      contentClassName="age-modal"
    >
      <Modal.Header className="border-0">
        <Modal.Title className="w-100 text-center age-title">
          Êtes-vous majeur ?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="age-subtitle">
          Cette page est réservée aux personnes de 18 ans et plus.
        </p>
        {message && <p className={`age-message ${isAdult ? 'success' : 'error'}`}>{message}</p>}
        <div className="age-button-group">
          <Button variant="success" size="lg" onClick={handleYes} className="age-btn">
            ✅ Oui
          </Button>
          <Button variant="danger" size="lg" onClick={handleNo} className="age-btn">
            ❌ Non
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AgeConfirmationModal;
