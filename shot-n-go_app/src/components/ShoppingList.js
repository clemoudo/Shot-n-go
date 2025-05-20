import { useState, useEffect } from 'react';
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({ selectedMachineIdState, cartState, addToCart, removeItem, machineState, machineShotsState }) {
   const { machines, fetchMachines } = machineState;
   const { machineShots, fetchMachineShots } = machineShotsState;
   const { selectedMachineId, setSelectedMachineId } = selectedMachineIdState;
   const { cart, setCart } = cartState;
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchMachines();
	}, []);

	useEffect(() => {
		if (machines.length > 0) {
			const firstId = machines[0].id;
			setSelectedMachineId(firstId);
			fetchMachineShots(firstId);
			setLoading(false);
		}
	}, [machines]);

	const handleChangeMachine = (machineId) => {
		if (cart.length > 0 && !window.confirm(`Voulez-vous vraiment supprimer votre panier actuel ?`)) return;
		setCart([]);
		setSelectedMachineId(machineId);
		fetchMachineShots(machineId);
	}

	if (loading) {
		return <div>Chargement des shots...</div>;
	}
	return (
		<div className="machine-selector-container">
			<div className="machine-selector-header">
				<label htmlFor="machine-select">Choisissez une machine :</label>
				<select
					id="machine-select"
					className="machine-select"
					value={selectedMachineId}
					onChange={(e) => {
						handleChangeMachine(e.target.value)
					}}
				>
					{machines.map((machine) => (
						<option key={`m${machine.id}`} value={machine.id}>
							{machine.name}
						</option>
					))}
				</select>
			</div>

			<ul className="shot-list">
				{machineShots.shots &&
					machineShots.shots.map((shotElem) => (
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
