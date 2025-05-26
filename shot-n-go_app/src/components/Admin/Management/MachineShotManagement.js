import { useState, useEffect } from "react";
import styles from "../Admin.module.css";
import axios from "axios";

export default function MachineShotManagement({
  machines,
  shots,
  machineShots, // Cet état contiendra les shots pour la machine sélectionnée pour la suppression
  fetchMachineShots, // Fonction pour charger les shots d'une machine spécifique
  fetchMachines, // Pour s'assurer que la liste des machines est à jour
  fetchShots, // Pour s'assurer que la liste des shots est à jour
  msg,
  setMessage,
}) {
  const [selectedMachineForAdding, setSelectedMachineForAdding] = useState("");
  const [selectedShotForAdding, setSelectedShotForAdding] = useState("");
  const [stockForAdding, setStockForAdding] = useState(0);

  const [selectedMachineForDeleting, setSelectedMachineForDeleting] = useState("");
  const [selectedShotForDeleting, setSelectedShotForDeleting] = useState("");

  // Charger les shots d'une machine quand elle est sélectionnée pour la suppression
  useEffect(() => {
    if (selectedMachineForDeleting) {
      fetchMachineShots(selectedMachineForDeleting);
    }
  }, [selectedMachineForDeleting]);
  
  // Rafraîchir les listes de base au montage si besoin (ou si elles peuvent changer ailleurs)
  useEffect(() => {
    fetchMachines();
    fetchShots();
  }, []);


  const handleNewMachineShotSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedMachineForAdding || !selectedShotForAdding) {
      setMessage("machineShotAdd", "Veuillez sélectionner une machine et un shot.");
      return;
    }
    if (stockForAdding < 0 || stockForAdding > 1) {
        setMessage("machineShotAdd", "Le stock doit être entre 0 (0%) et 1 (100%).");
        return;
    }

    const formData = new FormData();
    formData.append("stock", stockForAdding);

    try {
      const response = await axios.post(
        `/api/machines/${selectedMachineForAdding}/shots/${selectedShotForAdding}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("machineShotAdd", response.data.message || "Liaison ajoutée.");
      // Optionnel: rafraîchir les shots de la machine si on les affiche ici
      // fetchMachineShots(selectedMachineForAdding);
    } catch (err) {
      console.error("Erreur liaison machine-shot:", err);
      setMessage("machineShotAdd", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteMachineShot = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedMachineForDeleting || !selectedShotForDeleting) {
        setMessage("machineShotDelete", "Veuillez sélectionner une machine et un shot à délier.");
        return;
    }

    if (!window.confirm(`Supprimer le shot ID ${selectedShotForDeleting} de la machine ID ${selectedMachineForDeleting} ?`)) return;

    try {
      const response = await axios.delete(
        `/api/machines/${selectedMachineForDeleting}/shots/${selectedShotForDeleting}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("machineShotDelete", response.data.message || "Liaison supprimée.");
      fetchMachineShots(selectedMachineForDeleting); // Rafraîchir la liste des shots de la machine
      setSelectedShotForDeleting(""); // Réinitialiser la sélection du shot
    } catch (err) {
      console.error("Erreur suppression liaison:", err);
      setMessage("machineShotDelete", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <>
      {/* Ajouter un shot à une machine */}
      <section className={`${styles.form_container} ${styles.new_form}`}>
        <form onSubmit={handleNewMachineShotSubmit}>
          <fieldset>
            <legend>Lier un Shot à une Machine</legend>
            <label htmlFor="addMachineId">Machine</label>
            <select
              id="addMachineId"
              name="machineId"
              value={selectedMachineForAdding}
              onChange={(e) => setSelectedMachineForAdding(e.target.value)}
              required
            >
              <option value="" disabled>-- Choisir une machine --</option>
              {machines.map((machine) => (
                <option key={`m-add-${machine.id}`} value={machine.id}>
                  {machine.id} - {machine.name}
                </option>
              ))}
            </select>

            <label htmlFor="addShotId">Shot</label>
            <select
              id="addShotId"
              name="shotId"
              value={selectedShotForAdding}
              onChange={(e) => setSelectedShotForAdding(e.target.value)}
              required
            >
              <option value="" disabled>-- Choisir un shot --</option>
              {shots.map((shot) => (
                <option key={`s-add-${shot.id}`} value={shot.id}>
                  {shot.id} - {shot.name}
                </option>
              ))}
            </select>

            <label htmlFor="addStock">Stock (ex: 0.75 pour 75%)</label>
            <input
              id="addStock"
              name="stock"
              placeholder="Stock (ex: 0.5)"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={stockForAdding}
              onChange={(e) => setStockForAdding(parseFloat(e.target.value))}
              required
            />
            <button type="submit">Lier Shot à Machine</button>
            {msg.machineShotAdd && <p className={styles.msg}>{msg.machineShotAdd}</p>}
          </fieldset>
        </form>
      </section>

      {/* Supprimer un shot d'une machine */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form onSubmit={handleDeleteMachineShot}>
          <fieldset>
            <legend>Délier un Shot d'une Machine</legend>
            <label htmlFor="deleteMachineId">Machine</label>
            <select
              id="deleteMachineId"
              name="machineId"
              value={selectedMachineForDeleting}
              onChange={(e) => {
                setSelectedMachineForDeleting(e.target.value);
                setSelectedShotForDeleting(""); // Réinitialiser le shot quand la machine change
              }}
              required
            >
              <option value="" disabled>-- Choisir une machine --</option>
              {machines.map((machine) => (
                <option key={`m-del-${machine.id}`} value={machine.id}>
                  {machine.id} - {machine.name}
                </option>
              ))}
            </select>

            <label htmlFor="deleteShotId">Shot à délier</label>
            <select
              id="deleteShotId"
              name="shotId"
              value={selectedShotForDeleting}
              onChange={(e) => setSelectedShotForDeleting(e.target.value)}
              required
              disabled={!selectedMachineForDeleting || !machineShots.shots || machineShots.shots.length === 0}
            >
              <option value="" disabled>-- Choisir un shot --</option>
              {machineShots.shots && machineShots.shots.map((shot) => (
                <option key={`s-del-${shot.id}`} value={shot.id}>
                  {shot.id} - {shot.name} (Stock: {shot.stock * 100}%)
                </option>
              ))}
              {selectedMachineForDeleting && (!machineShots.shots || machineShots.shots.length === 0) && (
                <option value="" disabled>Aucun shot lié à cette machine</option>
              )}
            </select>
            <button type="submit" disabled={!selectedShotForDeleting}>Délier Shot</button>
            {msg.machineShotDelete && <p className={styles.msg}>{msg.machineShotDelete}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}