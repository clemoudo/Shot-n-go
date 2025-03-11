import React, { useState } from 'react';
import '../styles/alerte.css';

function AlertButton() {
    const [showAlert, setShowAlert] = useState(false);

    const handleAlertClick = () => {
        setShowAlert(true);
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return (
        <>
            <button className="alert-trigger" onClick={handleAlertClick}>
                Alerte Alcool
            </button>

            {showAlert && (
                <div className="alert-overlay">
                    <div className="alert-box">
                        <h1 className="alert-text">🚨 ALERTE : INSUFFISANCE D'ALCOOL 🚨</h1>
                        <button className="close-button" onClick={handleCloseAlert}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AlertButton;
