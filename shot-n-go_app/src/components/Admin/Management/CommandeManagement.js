import { useState, useEffect } from "react";
import styles from "../Admin.module.css";
import axios from "axios";

export default function CommandeManagement({ commandes, fetchCommandesInitial, msg, setMessage }) {
  const [stateCommande, setStateCommande] = useState("in progress");

  useEffect(() => {
    // fetchCommandesInitial vient du composant parent Admin.js
    // et il prend déjà 'stateCommande' en argument.
    // Ici, on veut juste le relancer quand stateCommande local change.
    if (fetchCommandesInitial) {
      fetchCommandesInitial(stateCommande);
    }
  }, [stateCommande]);


  const toggleState = async (commandeId) => {
    const token = localStorage.getItem("token");
    // L'état à envoyer est l'opposé de l'état actuel de la commande que l'on veut changer.
    // Si la liste actuelle est "in progress", les boutons devraient dire "Marquer comme 'done'"
    // et donc le newState envoyé à l'API sera 'done'.
    const currentCmd = commandes.commandes?.find(c => c.commande_id === commandeId);
    if (!currentCmd) return;

    const newState = currentCmd.state === "in progress" ? "done" : "in progress";

    try {
      const response = await axios.patch(`/api/commandes/${commandeId}/${newState}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("commandeUpdate", response.data.message || "Commande mise à jour.");
      if (fetchCommandesInitial) {
        fetchCommandesInitial(stateCommande); // Rafraîchit la liste avec le filtre actuel
      }
    } catch (error) {
      console.error("Erreur mise à jour commande :", error);
      setMessage("commandeUpdate", `Erreur: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <section className={`${styles.form_container} ${styles.commande}`}>
      <fieldset>
        <legend>Gestion des Commandes</legend>
        <label htmlFor="stateCommandeFilter">État des commandes à afficher :</label>
        <select id="stateCommandeFilter" value={stateCommande} onChange={(e) => setStateCommande(e.target.value)}>
          <option value="in progress">En cours</option>
          <option value="done">Terminées</option>
        </select>
        <h3>{commandes.count || 0} commande(s) "{stateCommande}"</h3>
        {msg.commandeUpdate && <p className={styles.msg}>{msg.commandeUpdate}</p>}
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Machine</th>
              <th>Email</th>
              <th>Timestamp</th>
              <th>État Actuel</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {commandes.commandes?.length > 0 ? (
              commandes.commandes.map((cmd) => (
                <tr key={`c${cmd.commande_id}`}>
                  <td>{cmd.commande_id}</td>
                  <td>{cmd.machine}</td>
                  <td>{cmd.user_email}</td>
                  <td>{cmd.order_date}</td>
                  <td>{cmd.state}</td>
                  <td>
                    <button onClick={() => toggleState(cmd.commande_id)}>
                      {cmd.state === "in progress" ? '"Terminée"' : '"En cours"'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Aucune commande à afficher pour cet état.</td>
              </tr>
            )}
          </tbody>
        </table>
      </fieldset>
    </section>
  );
}