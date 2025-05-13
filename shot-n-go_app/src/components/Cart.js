import { useState } from 'react'
import '../styles/Cart.css'

function Cart({cart, addToCart, removeItem, deleteItem, clearCart}) {
	const [isOpen, setIsOpen] = useState(false)
	const total = cart.reduce(
		(acc, shotType) => acc + shotType.amount * shotType.price, 0
	)
	let nbr_short_cart = 0
	cart.forEach(element => {
		nbr_short_cart += element.amount
	});
	
	return isOpen ? (
		<>
		<div className="overlay active" onClick={() => setIsOpen(false)}></div>
		<div className='cart open'>
			<button
				className='cart-button'
				onClick={() => setIsOpen(false)}
			>
				Fermer
			</button>
			<h2>Panier</h2>
			<h3>Total : {total.toFixed(2)}€</h3>
			{cart.length > 0 ? (
				<div>
					<table className="cart-table">
						<thead>
							<tr>
								<th>Nom</th><th>Quantité</th><th>Prix total €</th><th></th>
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
									<td className="quantity">
										<button onClick={() => removeItem(shotElem)}>-</button>
										<span>{shotElem.amount}</span>
										<button onClick={() => addToCart(shotElem,1)}>+</button>
									</td>
									<td className="price">{(shotElem.price * shotElem.amount).toFixed(2)}€</td>
									<td><button onClick={()=> deleteItem(shotElem)}> --- </button></td> 
								</tr>
							))}
						</tbody>
					</table>
					<button onClick={clearCart}>Vider le panier</button>
				</div>
			) : (
				<div>Votre panier est vide</div>
			)}
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
			{nbr_short_cart > 0 ? ("Ouvrir le panier (" + nbr_short_cart + ")"):('ouvrir le panier')}
			</button>
		</div>
		</>
	)
}

export default Cart