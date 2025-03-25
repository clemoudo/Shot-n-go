import { useState } from 'react'
import '../styles/Cart.css'

function remove_item(name, price, cart_table, update_table){
	const currentShotSaved = cart_table.find((shot) => shot.name === name)
		if (currentShotSaved.amount > 1) {
         const cartFilteredCurrentShot = cart_table.filter((shot) => shot.name !== name)
         update_table([
				...cartFilteredCurrentShot,
				{ name, price, amount: currentShotSaved.amount - 1 }
			])
		} else if (currentShotSaved.amount === 1){
			const cartFilteredCurrentShot = cart_table.filter((shot) => shot.name !== name)
			update_table([
				...cartFilteredCurrentShot
			])
		}

}

function Cart({cart_table, update_table}) {
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
			{/* <div>Exemple : {examplePrice}€</div>
			<button onClick={() => updateCart(cart + 1)}>Ajouter</button> */}
			<h3>Total : {total.toFixed(2)}€</h3>
			{cart_table.length > 0 ? (
				<div>
					<h2>Panier</h2>
					<p>name | price | amount </p>
					<ul>
						{cart_table.map(({ name, price, amount }, index) => (
							<div key={`${name}-${index}`}>
								
								{name} | {price}€ | {amount} | <button onClick={()=> remove_item(name, price, cart_table, update_table)}>-</button> 
							</div>
							
						))}
					</ul>
					<button onClick={() => update_table([])}>Vider le panier</button>
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
				Ouvrir le Panier
			</button>
		</div>
		</>
	)
}

export default Cart