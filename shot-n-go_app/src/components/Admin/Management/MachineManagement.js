import { useEffect, useState } from "react";
import styles from "../Admin.module.css";
import axios from "axios"; // Ou ton instance de service API

export default function MachineManagement({ machines, fetchMachines, msg, setMessage }) {
  const [newMachine, setNewMachine] = useState({ name: "" });

  useEffect(() => {
   fetchMachines();
  }, [])

  const handleNewMachineChange = (e) => {
    setNewMachine({ name: e.target.value });
  };

  const handleNewMachineSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!newMachine.name.trim()) {
      setMessage("machineAdd", "Le nom de la machine ne peut pas être vide.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newMachine.name);

    try {
      // Note: Tu utilisais fetch() avant, je standardise sur axios pour la cohérence
      const response = await axios.post("/api/machines", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "multipart/form-data" est géré par axios pour FormData
        },
      });

      setMessage("machineAdd", response.data.message || "Machine ajoutée avec succès !");
      setNewMachine({ name: "" });
      fetchMachines();
    } catch (err) {
      console.error("Erreur ajout machine :", err);
      setMessage("machineAdd", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm(`Supprimer la machine ID: ${machineId} ? Attention, cela pourrait affecter les commandes et les liaisons machine-shot.`)) return;

    try {
      // Note: Tu utilisais fetch() avant
      const response = await axios.delete(`/api/machines/${machineId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("machineDelete", response.data.message || `Machine ${machineId} supprimée.`);
      fetchMachines();
    } catch (err) {
      console.error("Erreur suppression machine :", err);
      setMessage("machineDelete", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <>
      {/* Ajouter une machine */}
      <section className={`${styles.form_container} ${styles.new_form}`}>
        <form onSubmit={handleNewMachineSubmit}>
          <fieldset>
            <legend>Ajouter une Machine</legend>
            <label htmlFor="machineName">Nom de la machine</label>
            <input
              id="machineName"
              name="name"
              placeholder="Nom de la nouvelle machine"
              type="text"
              value={newMachine.name}
              onChange={handleNewMachineChange}
              required
            />
            <button type="submit">Ajouter Machine</button>
            {msg.machineAdd && <p className={styles.msg}>{msg.machineAdd}</p>}
          </fieldset>
        </form>
      </section>

      {/* Supprimer une machine */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!e.target.elements.machineId.value) {
                setMessage("machineDelete", "Veuillez sélectionner une machine à supprimer.");
                return;
            }
            const machineId = parseInt(e.target.elements.machineId.value);
            handleDeleteMachine(machineId);
          }}
        >
          <fieldset>
            <legend>Supprimer une Machine</legend>
            <label htmlFor="machineIdSelect">Sélectionnez une machine à supprimer</label>
            <select name="machineId" id="machineIdSelect" defaultValue="">
              <option value="" disabled>-- Choisir une machine --</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.id} - {machine.name}
                </option>
              ))}
            </select>
            <button type="submit">Supprimer Machine</button>
            {msg.machineDelete && <p className={styles.msg}>{msg.machineDelete}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}