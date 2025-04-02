import { useState } from 'react'
import '../styles/Cart.css'

function Cart({cart_table, setCartTable, addToCart, removeItem}) {
	const [isOpen, setIsOpen] = useState(false)
	const total = cart_table.reduce(
		(acc, shotType) => acc + shotType.amount * shotType.price, 0
	)

	
	return isOpen ? (
		<>
		<div class="overlay active"></div>
		<div className='cart open'>
			<button
				className='cart-button'
				onClick={() => setIsOpen(false)}
			>
				Fermer
			</button>
			<h2>Panier</h2>
			<h3>Total : {total.toFixed(2)}€</h3>
			{cart_table.length > 0 ? (
				<div>
					<table className="cart-table">
						<thead>
							<tr>
								<th>Nom</th><th>Quantité</th><th>Prix total €</th><th></th>
							</tr>
						</thead>
						<tbody>
							{cart_table
							.sort(function(shotA, shotB){
								if (shotA.name > shotB.name)return 1;
								if (shotA.name < shotB.name)return -1;
								return 0;
							})
							.map((shotElem) => (
								<tr key={`${shotElem.id}`}>
									<td className="product">
										<div className="product-info">
											<img src={`data:image/jpeg;base64,${shotElem.cover}`} alt={shotElem.name} />
											<span className="product-name">{shotElem.name}</span>
											<span class="product-unitPrice">{shotElem.price}€</span>
										</div>
									</td>
									<td className="quantity">
										<button onClick={() => removeItem(shotElem)}>-</button>
										<span>{shotElem.amount}</span>
										<button onClick={() => addToCart(shotElem,1)}>+</button>
									</td>
									<td className="price">{(shotElem.price * shotElem.amount).toFixed(2)}€</td>
									<td><button onClick={()=> removeItem(shotElem)}> --- </button></td> 
								</tr>
							))}
						</tbody>
					</table>
					<button onClick={() => setCartTable([])}>Vider le panier</button>
				</div>
			) : (
				<div>Votre panier est vide</div>
			)}
		</div>
		</>
	) : (
		<>
		<div class="overlay"></div>
		<div className='cart'>
			<button
				className='cart-button'
				onClick={() => setIsOpen(true)}
			>
			{cart_table.length > 0 ? ("ouvrir le panier(" + cart_table.length + ")"):('ouvrir le panier')}
			</button>
		</div>
		</>
	)
}

export default Cart