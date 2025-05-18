import { useState, useEffect } from 'react';
import ShotItem from './ShotItem'
import '../styles/ShoppingList.css'

function ShoppingList({addToCart, removeItem, machineState, machineShotsState}) {
   const { machines, fetchMachines } = machineState;
   const { machineShots, fetchMachineShots } = machineShotsState;
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState("all")
	const [selectedMachineId, setSelectedMachineId] = useState("");


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
						setSelectedMachineId(e.target.value);
						fetchMachineShots(e.target.value);
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
