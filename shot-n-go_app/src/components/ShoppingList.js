import { shotList } from '../datas/shotList'
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({cart,updateCart,cart_table,update_table}) {
	const categories = shotList.reduce(
		(acc, shot) =>
			acc.includes(shot.category) ? acc : acc.concat(shot.category),
		[]
	)

	return (
		<div>
			<ul className='categories'>
				{categories.map((cat) => (
					<li key={cat}>{cat}</li>
				))}
			</ul>
			<ul className='shot-list'>
				{shotList.map(({ id, cover, name, alcoholLevel, sweetness,price }) => (
					<ShotItem
						id={id}
						cover={cover}
						name={name}
						alcoholLevel={alcoholLevel}
						sweetness={sweetness}
						price = {price.toFixed(2)}
						cart = {cart}
						updateCart= {updateCart}
						cart_table={cart_table}
						update_table={update_table}
					/>
				))}
			</ul>
		</div>
	)
}

export default ShoppingList
