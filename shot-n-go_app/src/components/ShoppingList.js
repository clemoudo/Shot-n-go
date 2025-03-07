import { shotList } from '../datas/shotList'
import PlantItem from './PlantItem'
import '../styles/ShoppingList.css'

function ShoppingList() {
	const categories = shotList.reduce(
		(acc, shot) =>
			acc.includes(shot.category) ? acc : acc.concat(shot.category),
		[]
	)

	return (
		<div>
			<ul>
				{categories.map((cat) => (
					<li key={cat}>{cat}</li>
				))}
			</ul>
			<ul className='lmj-plant-list'>
				{shotList.map(({ id, cover, name, alcoholLevel, sweetness }) => (
					<PlantItem
						id={id}
						cover={cover}
						name={name}
						alcoholLevel={alcoholLevel}
						sweetness={sweetness}
					/>
				))}
			</ul>
		</div>
	)
}

export default ShoppingList
