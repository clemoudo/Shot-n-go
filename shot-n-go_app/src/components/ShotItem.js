import React, { useState, useEffect } from 'react';
import TasteScale from './TasteScale';
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
        <li className="shot-item" key={shotElem.id}>
            {imageUrl ? (
                <img className="shot-item-cover" src={imageUrl} alt={`${shotElem.name} cover`} />
            ) : (
                <p>Image non disponible</p>
            )}
            {shotElem.name}
            <div>
                <TasteScale tasteType="alcoholLevel" scaleValue={shotElem.alcoholLevel} />
                <TasteScale tasteType="sweetness" scaleValue={shotElem.sweetness} />
                {(shotElem.stock <= 10)?(<p className="pricecase">!!OUT OF STOCK!!</p>):(<div className='priceButton'><p className="pricecase">prix: {shotElem.price.toFixed(2)}€</p><table><td className="quantity">
										<button onClick={lessOneAddAmout}>-</button>
										<button onClick={() => {addToCart(shotElem,addAmount); setAddAmount(0)}}>{addAmount}</button>
										<button onClick={plusOneAddAmout}>+</button>
									</td></table></div>)}

            </div>
        </li>
    );
}

export default ShotItem;
