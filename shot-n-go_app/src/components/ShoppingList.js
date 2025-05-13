import { useState, useEffect } from 'react';
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({addToCart, removeItem, shotState}) {
   const { shots, fetchShots } = shotState;
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState("all")

	useEffect(() => {
      fetchShots();
		setLoading(false);
   }, []);
	
	if (loading) {
		return <div>Chargement des shots...</div>;
	}
	return (
		<div>
			<ul className='shot-list'>
				{shots.map((shotElem) => (
						<ShotItem
							key={shotElem.id}
							shotElem={shotElem}
							addToCart={addToCart}
							removeItem={removeItem}
						/>
					))}
			</ul>
		</div>
	);
}

export default ShoppingList
