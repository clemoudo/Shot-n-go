import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function AgeVerificationModal() {
  const [age, setAge] = useState('');
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(true);

  const handleCheckAge = () => {
    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber)) {
      setMessage("Veuillez entrer un âge valide.");
    } else if (ageNumber >= 18) {
      setShow(false); // Fermer la modale si 18+
    } else {
      setMessage("Accès refusé : vous avez moins de 18 ans.");
    }
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Vérification d'âge</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Quel est votre âge ?</Form.Label>
            <Form.Control
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Entrez votre âge"
            />
          </Form.Group>
        </Form>
        {message && <p className="mt-3 text-danger">{message}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleCheckAge}>
          Vérifier
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AgeVerificationModal;
