import { useState, useEffect } from "react";
import '../styles/Admin_pannel_machines.css';

function Admin_pannel_machines({ shots }) {
    const [Machines, setMachines] = useState([]);
    const [name, setName] = useState("");
    const [shotSel, setShotSel] = useState([shots[0].id, shots[1].id, shots[2].id]);
    const [shot1, setShot1] = useState(shots[0].id);
    const [shot2, setShot2] = useState(shots[1].id);
    const [shot3, setShot3] = useState(shots[2].id);


    

    const fetchMachine = async () => {
        try {
            const response = await fetch("/api/machine/gt_all/");
            if (response.ok) {
                const data = await response.json();
                setMachines(data);
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
        }
    };
    useEffect(() => {
        fetchMachine();
        const intervalId = setInterval(fetchMachine, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDelete = async (machine_name) => {
        console.log(machine_name)
        try {
            const response = await fetch(`/api/machine/supr/${machine_name}`, { method: "DELETE" });
            if (response.ok) {
                alert("Machine supprimée !");
                fetchMachine();
            } else {
                alert("Machine introuvable.");
            }
        } catch (error) {
          alert("Erreur de connexion au serveur.");
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('alcools', String(shot1));
        formData.append('alcools', String(shot2));
        formData.append('alcools', String(shot3));

        try {
            const response = await fetch("/api/machine/send/", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert("Machine ajoutée !");
                fetchMachine();
                console.log(`Ajout de la machine : ${data}`);
            } else {
                alert("Erreur lors de l'ajout de la machine.");
            }
        } catch (error) {
            console.error("Erreur d'upload ou de connexion :", error);
            alert("Erreur lors de l'ajout de la machine.");
        }
    };

    return (
        <div className="admin-container">
            <h2 className="admin-title">Ajouter une Machine</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <input
                    className="admin-input"
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label htmlFor="shot1">Choose shots n°1: </label>
                <select
                    id="shot1"
                    name="shot1"
                    onChange={(e) => {
                        setShot1(e.target.value);
                        setShotSel([e.target.value, shot2, shot3]);
                    }}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[0] !== shot.id) ? (
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
                    onChange={(e) => {
                        setShot2(e.target.value);
                        setShotSel([shot1, e.target.value, shot3]);
                    }}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[1] !== shot.id) ? (
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
                    onChange={(e) => {
                        setShot3(e.target.value);
                        setShotSel([shot1, shot2, e.target.value]);
                    }}
                >
                    {shots.map((shot) => (
                        (shotSel.includes(shot.id) && shotSel[2] !== shot.id) ? (
                            <option key={shot.id} disabled>-- shot déjà sélectionné --</option>
                        ) : (
                            <option key={shot.id} value={shot.id}>{shot.name}</option>
                        )
                    ))}
                </select>

                <button type="submit" className="admin-button">
                    Ajouter
                </button>
            </form>

            <div className="machine-container">
                <h2 className="machine-title">Liste des machines</h2>
                {Machines.map((machine, idx) => (
                    <div key={idx} className="machine-card">
                    <h3 className="machine-name">{machine.nom}</h3>
                    <button 
                        className="admin-button-delete"
                        onClick={() => handleDelete(machine.nom)}
                    >
                        Supprimer
                    </button>
                        <table className="machine-table">
                            <thead>
                                <tr>
                                    <th>Nom de l'alcool</th>
                                    <th>Catégorie</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {machine.alcools.length > 0 ? (
                                    machine.alcools.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.alcool.name}</td>
                                            <td>{item.alcool.category}</td>
                                            <td>{item.stock ? 'Oui' : 'Non'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="empty-message">Aucun alcool</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Admin_pannel_machines;
