import { useState } from 'react'
import styles from './Cart.module.css'
import axios from "axios";
import { 
	calculateTotalPrice,
	formatCurrency,
	calculateAmoutShot
} from '../../utils/cartUtils';

function Cart({selectedMachineId, walletState, cartState, addToCart, removeItem, deleteItem}) {
	const { wallet, fetchWallet } = walletState;
	const { cart, setCart } = cartState;
	const [isOpen, setIsOpen] = useState(false)
	const [isValid, setIsValid] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false);
	const toggleIsValid = () => setIsValid(!isValid)

	const handlePurchase = async () => {
		if (isProcessing) return; // Empêche les clics multiples si déjà en cours
		setIsProcessing(true);

		const token = localStorage.getItem("token");
		if (!token) {
			alert("Utilisateur non authentifié.");
			return;
		}

		if (!selectedMachineId) {
			alert("Veuillez sélectionner une machine.");
			return;
		}

		if (!cart.length) {
			alert("Votre panier est vide.");
			return;
		}

		const purchaseCart = cart.map((shot) => ({
			shot_id: shot.id,
			quantity: shot.amount,
		}));

		const commande = {
			machine_id: selectedMachineId,
			shots: purchaseCart,
		};

		try {
			const response = await axios.post("/api/commandes", commande, {
				headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				},
			});

			const { message, commande_id, total_cost, credit_restant } = response.data;
			alert(`${message}\nCommande #${commande_id}\nTotal: ${total_cost}€\nCrédit restant: ${credit_restant}€`);

			// Réinitialiser le panier
			fetchWallet();
			setCart([]);
			setIsValid(false);
		} catch (err) {
			console.error("Erreur lors de la commande :", err);
			const msg = err.response?.data?.detail || "Erreur inconnue lors de la commande.";
			console.log(msg);
		} finally {
			setIsProcessing(false);
		}
	};

	const total = calculateTotalPrice(cart);
	
	return isOpen ? (<>
		{/* Panier ouvert */}
		<div className={`${styles.overlay} ${styles.active}`} onClick={() => setIsOpen(false)}></div>
		<div className={`${styles.cart} ${styles.open} ${isValid ? styles.valid: ""}`}>
			<div>
				<button
					className={styles.cart_button}
					onClick={() => setIsOpen(false)}
				>
					Fermer
				</button>
				{/* Panier en lui-même */}
				<h1>Panier</h1>
				<h2>Total : {formatCurrency(total)}</h2>
				{cart.length > 0 ? (
					// Panier rempli
					<div>
						<table className={styles.cart_table}>
							<thead>
								<tr>
									<th>Nom</th><th>Quantité</th><th>Prix total €</th>
									{!isValid && <th></th>}
								</tr>
							</thead>
							<tbody>
								{cart
								.sort(function(shotA, shotB){
									if (shotA.name > shotB.name)return 1;
									if (shotA.name < shotB.name)return -1;
									return 0;
								})
								.map((shotElem) => (
									<tr key={`${shotElem.id}`}>
										<td className={styles.product}>
											<div className={styles.product_info}>
												<img loading='lazy' src={`/api/images/${shotElem.image}`} alt={shotElem.name} />
												<span className={styles.product_name}>{shotElem.name}</span>
												<span className={styles.product_unitPrice}>{shotElem.price}€</span>
											</div>
										</td>
										<td className={styles.cart_quantity}>
											<button onClick={() => removeItem(shotElem)}>-</button>
											<span>{shotElem.amount}</span>
											<button onClick={() => addToCart(shotElem,1)}>+</button>
										</td>
										<td className={styles.cart_price}>{(shotElem.price * shotElem.amount).toFixed(2)}€</td>
										{!isValid && <td className={styles.cart_remove}><button onClick={()=> deleteItem(shotElem)}>x</button></td>}
									</tr>
								))}
							</tbody>
						</table>
						<button className={styles.cart_setValid} onClick={toggleIsValid}>{isValid ? "Annuler" : "Valider le panier"}</button>
						{isValid && 
							<button className={styles.cart_purshase} onClick={handlePurchase} disabled={isProcessing}>
								{isProcessing ? 'Traitement...' : 'Payer'}
							</button>
						}
					</div>
				) : (
					// Panier vide
					<div>Votre panier est vide</div>
				)}
			</div>
		</div>
	</>) : (<>
		{/* Panier fermé */}
		<div className={styles.overlay}></div>
		<div className={styles.cart}>
			<button
				className={styles.cart_button}
				onClick={() => setIsOpen(true)}
			>
			{`Ouvrir le panier ( ${calculateAmoutShot(cart)} )`}
			</button>
		</div>
	</>)
}

export default Cart