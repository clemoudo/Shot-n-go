//import { shotList } from '../datas/shotList'
import { useEffect,useState } from 'react';
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({addToCart, removeItem, shots, setShots}) {
	const [loading,setLoading] = useState(true)
	const [listMachine,setMachine] = useState([])
	const [filter,setFilter] = useState("all")
	
	const fetchmachines = async () => {
		try {
		  const response = await fetch("/api/machine/gt_all/");
		  if (response.ok) {
			const data = await response.json();
			setMachine(data)
			setLoading(false)
		  } else {
			console.error("Erreur lors de la récupération des machines.");
		  }
		} catch (error) {
		  console.error("Erreur de connexion:", error);
		}
	  };
	
	
	 useEffect(() => {
		fetchmachines();
		// Mettre en place un intervalle pour récupérer les utilisateurs toutes les 5 secondes
		const intervalId = setInterval(fetchmachines, 60000); // Rafraîchir toutes les 5 secondes
	
		// Nettoyage de l'intervalle lors du démontage du composant
		return () => clearInterval(intervalId);
	  }, []);
	
	if (loading) {
		return <div>Chargement des shots...</div>;
	}
	return (
		<div>
			{(listMachine.length >= 1)?(
				<div className='sort_by'>
					<div className="dropdown">
						<button className="dropbtn">
							{(filter === "all")?("all"):(listMachine.find((machine) => machine.id === filter).nom)}
							<i className="fa fa-caret-down" />
						</button>
						<div className="dropdown-content">
							<button onClick={() => setFilter("all")}>all</button>
							{listMachine.map((machine) =>(<button onClick={() => setFilter(machine.id)}>{machine.nom}</button>))}
						</div>
					</div>
				</div>)
			:(
			<div className='sort_by'> </div>)}
			<ul className='shot-list'>

				{(filter === "all")?(shots.map((shotElem) => (
					<ShotItem
						shotElem={shotElem}
						addToCart={addToCart} 
						removeItem={removeItem}
					/>
				))):(listMachine.find((machine) => machine.id === filter).alcools.map((shotElem) => (
					<ShotItem
						shotElem={shotElem.alcool}
						addToCart={addToCart} 
						removeItem={removeItem}
					/>)))}
			</ul>
		</div>
	)
}

export default ShoppingList
