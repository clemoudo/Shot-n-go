import React, { useState, useEffect } from 'react';
import '../styles/ShotItem.css';

function ShotItem({ shotElem, addToCart }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addAmount, setAddAmount] = useState(0)

    const lessOneAddAmout = () => {
        if (addAmount > 0){
            setAddAmount(addAmount - 1);
        }
    };

    const plusOneAddAmout = () => {
        setAddAmount(addAmount + 1);
    };

    useEffect(() => {
        // Vérifie si 'shotElem.cover' existe et qu'il s'agit d'une chaîne base64
        if (shotElem.image) {
            // setImageUrl(`data:image/jpeg;base64,${shotElem.cover}`);  // Assumes the image is stored in JPEG format
            setLoading(false);  // L'image est prête
        } else {
            setError('Image non disponible');
            setLoading(false);
        }
    }, [shotElem.cover]);  // Déclenche le hook lorsque shotElem.cover change

    if (loading) {return <p>Chargement de l'image...</p>} 
    if (error) {return <p>{error}</p>}

    return (
        <li className="shot-item" key={shotElem.id}>
            {/* Affichage de l'image */}
            {shotElem.image ? (
                <img className="shot-item-cover" src={`/images/${shotElem.image}`} alt={`${shotElem.name} image`} />
            ) : (
                <p>Image non disponible</p>
            )}

            {/* Nom du shot */}
            <p>{shotElem.name}</p>

            <div>
                {/* Stock */}
                {shotElem.stock <= 0.1 ? (
                    <p className="pricecase">OUT OF STOCK</p>
                ) : (
                    <div className="priceButton">
                        {/* Prix */}
                        {shotElem.price ? (
                            <p className="pricecase">Prix: {shotElem.price.toFixed(2)}€</p>
                        ) : (
                            <p className="pricecase">Prix indisponible</p>
                        )}

                        {/* Contrôles de quantité */}
                        <div className="quantity">
                            <button onClick={lessOneAddAmout}>-</button>
                            <button onClick={() => { addToCart(shotElem, addAmount); setAddAmount(0); }}>
                                {addAmount}
                            </button>
                            <button onClick={plusOneAddAmout}>+</button>
                        </div>
                    </div>
                )}
            </div>
        </li>
    );
}

export default ShotItem;
