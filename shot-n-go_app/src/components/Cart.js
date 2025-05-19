import { useState } from 'react'
import '../styles/Cart.css'

function Cart({selectedMachineId, cart, addToCart, removeItem, deleteItem}) {
	const [isOpen, setIsOpen] = useState(false)
	const [isValid, setIsValid] = useState(false)
	const toggleIsValid = () => setIsValid(!isValid)

	const total = cart.reduce(
		(acc, shotType) => acc + shotType.amount * shotType.price, 0
	)
	let nbr_short_cart = 0
	cart.forEach(element => {
		nbr_short_cart += element.amount
	});

	const handlePurshase = () => {
		let purshaseCart = cart.map((shot) => ({
			id: shot.id,
			quantity: shot.amount
		}))

		console.log(selectedMachineId, purshaseCart);
	}
	
	return isOpen ? (
		<>
		<div className="overlay active" onClick={() => setIsOpen(false)}></div>
		<div className={`cart open${isValid ? " valid" : ""}`}>
			<div>
				<button
					className='cart-button'
					onClick={() => setIsOpen(false)}
				>
					Fermer
				</button>
				<h1>Panier</h1>
				<h2>Total : {total.toFixed(2)}€</h2>
				{cart.length > 0 ? (
					<div>
						<table className="cart-table">
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
										<td className="product">
											<div className="product-info">
												<img loading='lazy' src={`/images/${shotElem.image}`} alt={shotElem.name} />
												<span className="product-name">{shotElem.name}</span>
												<span className="product-unitPrice">{shotElem.price}€</span>
											</div>
										</td>
										<td className="cart-quantity">
											<button onClick={() => removeItem(shotElem)}>-</button>
											<span>{shotElem.amount}</span>
											<button onClick={() => addToCart(shotElem,1)}>+</button>
										</td>
										<td className="cart-price">{(shotElem.price * shotElem.amount).toFixed(2)}€</td>
										{!isValid && <td className='cart-remove'><button onClick={()=> deleteItem(shotElem)}>x</button></td>}
									</tr>
								))}
							</tbody>
						</table>
						<button className='cart-setValid' onClick={toggleIsValid}>{isValid ? "Annuler" : "Valider le panier"}</button>
						{isValid && <button className='cart-purshase' onClick={handlePurshase}>Payer</button>}
					</div>
				) : (
					<div>Votre panier est vide</div>
				)}
			</div>
		</div>
		</>
	) : (
		<>
		<div className="overlay"></div>
		<div className='cart'>
			<button
				className='cart-button'
				onClick={() => setIsOpen(true)}
			>
			{nbr_short_cart > 0 ? ("Ouvrir le panier (" + nbr_short_cart + ")"):('Ouvrir le panier')}
			</button>
		</div>
		</>
	)
}

export default Cart