import { useState } from 'react'
import '../styles/Cart.css'

function Cart() {
	const examplePrice = 8
	const [cart, updateCart] = useState(0)
	const [isOpen, setIsOpen] = useState(false)

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
			<div>Exemple : {examplePrice}€</div>
			<button onClick={() => updateCart(cart + 1)}>Ajouter</button>
			<h3>Total : {examplePrice * cart}€</h3>
			<button onClick={() => updateCart(0)}>Vider le panier</button>
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