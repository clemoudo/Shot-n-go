import { useState, useEffect } from 'react';
import styles from './ShotItem.module.css';
import {lessOneAddAmout,plusOneAddAmout} from '../../utils/shotitemUtils.mjs'

function ShotItem({ shotElem, addToCart }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addAmount, setAddAmount] = useState(0)



    useEffect(() => {
        // Vérifie si 'shotElem.cover' existe et qu'il s'agit d'une chaîne base64
        if (shotElem.image) {
            // setImageUrl(`data:image/jpeg;base64,${shotElem.cover}`);  // Assumes the image is stored in JPEG format
            setLoading(false);  // L'image est prête
        } else {
            setError('Image non disponible');
            setLoading(false);
        }
    }, [shotElem.image]);  // Déclenche le hook lorsque shotElem.image change

    if (loading) {return <p>Chargement de l'image...</p>} 
    if (error) {return <p>{error}</p>}

    return (
        <li className={styles.shot_item} key={shotElem.id}>
            <div className={styles.shot_item_container}>
                <img className={styles.shot_item_cover} loading='lazy' src={`/api/images/${shotElem.image}`} alt={`${shotElem.name}`} />
                <div className={styles.shot_item_details}>
                    <p className={styles.shot_name}>{shotElem.name}</p>
                    <p className={styles.pricecase}>{shotElem.price} €</p>
                    <div className={styles.quantity}>
                        <button onClick={() => lessOneAddAmout(addAmount, setAddAmount)}>-</button>
                            <button onClick={() => { addToCart(shotElem, addAmount); setAddAmount(0); }}>
                                {addAmount}
                            </button>
                            <button onClick={() => plusOneAddAmout(addAmount, setAddAmount)}>+</button>
                    </div>
                </div>
            </div>
        </li>
    );
}

export default ShotItem;
