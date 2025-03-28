//import { shotList } from '../datas/shotList'
import { useEffect,useState } from 'react';
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({addToCart, removeItem}) {
	const [shots, setShots] = useState([]);
	const [loading,setLoading] = useState(true)
	const fetchShots = async () => {
		try {
		  const response = await fetch("http://54.36.181.67:8000/get_shots/");
		  if (response.ok) {
			const data = await response.json();
			setShots(data.shots)
			setLoading(false)
		  } else {
			console.error("Erreur lors de la récupération des utilisateurs.");
		  }
		} catch (error) {
		  console.error("Erreur de connexion:", error);
		}
	  };
	 useEffect(() => {
		fetchShots(); // Appeler fetchUsers immédiatement après le premier rendu
	
		// Mettre en place un intervalle pour récupérer les utilisateurs toutes les 5 secondes
		const intervalId = setInterval(fetchShots, 10000); // Rafraîchir toutes les 5 secondes
	
		// Nettoyage de l'intervalle lors du démontage du composant
		return () => clearInterval(intervalId);
	  }, []);
	
	if (loading) {
		return <div>Chargement des shots...</div>;
	}
	return (
		<div>
			{/* 
			<ul className='categories'>
    			{categories.map((cat) => (
        		<li key={cat}>{cat}</li>
    			))}
			</ul> 
			*/}
			<ul className='shot-list'>
				{shots.map((shotElem) => (
					<ShotItem
						shotElem={shotElem}
						addToCart={addToCart} 
						removeItem={removeItem}
					/>
				))}
			</ul>
		</div>
	)
}

export default ShoppingList
