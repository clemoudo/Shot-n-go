import { useState, useEffect } from "react";

function Admin_pannel_machines({shots, setShots, loading, setLoading, fetchShots}) {
    const [name, setName] = useState("");
    const [alcools, setAlcools] = useState({});
    const [shotSel, setShotSel] = useState([]); // Tableau pour stocker les IDs des shots sélectionnés
    const [shot1, setShot1] = useState("");
    const [shot2, setShot2] = useState("");
    const [shot3, setShot3] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ajouter les shots sélectionnés au tableau shotSel
        setShotSel([shot1, shot2, shot3]);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('shot1', shot1);
        formData.append('shot2', shot2);
        formData.append('shot3', shot3);
        try {
            const response = await fetch("/api/machine/send/", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert("Machine ajouté !");
                fetchShots(); // Actualiser la liste des shots
                console.log(`ajout du shot ${data}`);
            } else {
                alert("Erreur lors de l'ajout du shot.");
            }
        } catch (error) {
            console.error("Erreur d'upload ou de connexion :", error);
            alert("Erreur lors de l'ajout du shot.");
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto bg-gray-50 min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ajouter une Machine</h2>
            <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-xl shadow-lg space-y-4">
                <input
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="shot1">Choose shots n°2: </label>
                <select
                    id="shot1"
                    name="shot1"
                    onChange={(e) => (setShot1(e.target.value), setShotSel([e.target.value,shot2,shot3]),console.log(shotSel))}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[0] != shot.id) ? (
                            <option key={shot.id} disabled>-- shot déjà sélectionné --</option>
                        ) : (
                            <option key={shot.id} value={shot.id}>{shot.name}</option>
                        )
                    ))}
                </select>

                <label htmlFor="shot2">Choose shots n°2:</label>
                <select
                    id="shot2"
                    name="shot2"
                    onChange={(e) => (setShot2(e.target.value),setShotSel([shot1,e.target.value,shot3]))}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[1] != shot.id) ? (
                            <option key={shot.id} disabled>-- shot déjà sélectionné --</option>
                        ) : (
                            <option key={shot.id} value={shot.id}>{shot.name}</option>
                        )
                    ))}
                </select>

                <label htmlFor="shot3">Choose shots n°3:</label>
                <select
                    id="shot3"
                    name="shot3"
                    onChange={(e) => (setShot3(e.target.value),setShotSel([shot1,shot2,e.target.value]))}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[2] != shot.id) ? (
                            <option key={shot.id} disabled>-- shot déjà sélectionné --</option>
                        ) : (
                            <option key={shot.id} value={shot.id}>{shot.name}</option>
                        )
                    ))}
                </select>

                <button type="submit" className="w-full bg-gray-800 text-black p-3 rounded-lg hover:bg-gray-900">
                    Ajouter
                </button>
            </form>

            <h2 className="text-3xl font-semibold text-gray-800 mt-10 mb-6">Liste des Machines</h2>
        </div>
    );
}

export default Admin_pannel_machines;
