import { shotList } from '../datas/shotList'
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({cart_table, update_table}) {
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
				{shotList.map((shotElem) => (
					<ShotItem
						shotElem={shotElem}
						cart_table={cart_table}
						update_table={update_table}
					/>
				))}
			</ul>
		</div>
	)
}

export default ShoppingList
