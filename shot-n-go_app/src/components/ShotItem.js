import React, { useState, useEffect } from 'react';
import TasteScale from './TasteScale';
import '../styles/ShotItem.css';

function ShotItem({ shotElem, addToCart, removeItem }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Vérifie si 'shotElem.cover' existe et qu'il s'agit d'une chaîne base64
        if (shotElem.cover) {
            setImageUrl(`data:image/jpeg;base64,${shotElem.cover}`);  // Assumes the image is stored in JPEG format
            setLoading(false);  // L'image est prête
        } else {
            setError('Image non disponible');
            setLoading(false);
        }
    }, [shotElem.cover]);  // Déclenche le hook lorsque shotElem.cover change

    if (loading) {
        return (
            <li className="shot-item" key={shotElem.id}>
                <p>Chargement de l'image...</p>
            </li>
        );
    }

    if (error) {
        return (
            <li className="shot-item" key={shotElem.id}>
                <p>{error}</p>
            </li>
        );
    }

    return (
        <li className="shot-item" key={shotElem.id} onClick={() => addToCart(shotElem)}>
            {imageUrl ? (
                <img className="shot-item-cover" src={imageUrl} alt={`${shotElem.name} cover`} />
            ) : (
                <p>Image non disponible</p>
            )}
            <p>{shotElem.name}</p>
            <div>
                <TasteScale tasteType="alcoholLevel" scaleValue={shotElem.alcoholLevel} />
                <TasteScale tasteType="sweetness" scaleValue={shotElem.sweetness} />
                <p className="pricecase">prix: {shotElem.price.toFixed(2)}€</p>
            </div>
        </li>
    );
}

export default ShotItem;
