import { useState } from "react";
import styles from "../Admin.module.css";
import axios from "axios";

export default function WalletManagement({ fetchWallet, msg, setMessage }) { // fetchWallet est pour Admin.js, ici on ne l'utilise pas directement pour afficher
  const [userEmailToAdd, setUserEmailToAdd] = useState("");
  const [amountToAdd, setAmountToAdd] = useState("");
  const [userEmailToDelete, setUserEmailToDelete] = useState("");


  const handleNewWalletSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!userEmailToAdd.trim() || !amountToAdd) {
        setMessage("walletAdd", "Veuillez remplir l'email et le montant.");
        return;
    }

    const formData = new FormData();
    formData.append("user_email", userEmailToAdd);
    formData.append("amount", parseFloat(amountToAdd));

    try {
      const response = await axios.post(`/api/wallets`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("walletAdd", response.data.message || "Opération wallet réussie.");
      setUserEmailToAdd("");
      setAmountToAdd("");
      if(fetchWallet) fetchWallet(); // Rafraîchir le wallet de l'utilisateur admin si nécessaire
    } catch (err) {
      console.error("Erreur crédit wallet:", err);
      setMessage("walletAdd", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteWallet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
     if (!userEmailToDelete.trim()) {
        setMessage("walletDelete", "Veuillez entrer un email pour la suppression.");
        return;
    }

    if (!window.confirm(`Supprimer le wallet de "${userEmailToDelete}" ? Cette action est irréversible.`)) return;

    try {
      const response = await axios.delete(`/api/wallets/${userEmailToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("walletDelete", response.data.message || "Wallet supprimé.");
      setUserEmailToDelete("");
      if(fetchWallet) fetchWallet();
    } catch (err) {
      console.error("Erreur suppression wallet:", err);
      setMessage("walletDelete", `Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <>
      {/* Créditer un wallet */}
      <section className={`${styles.form_container} ${styles.new_form}`}>
        <form onSubmit={handleNewWalletSubmit}>
          <fieldset>
            <legend>Créditer un Wallet</legend>
            <label htmlFor="walletUserEmailAdd">Email utilisateur</label>
            <input
              id="walletUserEmailAdd"
              name="userEmail"
              type="email"
              placeholder="exemple@domaine.com"
              value={userEmailToAdd}
              onChange={(e) => setUserEmailToAdd(e.target.value)}
              required
            />
            <label htmlFor="walletAmountAdd">Montant (€)</label>
            <input
              id="walletAmountAdd"
              name="amount"
              type="number"
              step="0.01"
              min="0.01" // On ne peut pas créditer 0 ou négatif
              placeholder="10.00"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              required
            />
            <button type="submit">Créditer le Wallet</button>
            {msg.walletAdd && <p className={styles.msg}>{msg.walletAdd}</p>}
          </fieldset>
        </form>
      </section>

      {/* Supprimer un wallet */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form onSubmit={handleDeleteWallet}>
          <fieldset>
            <legend>Supprimer un Wallet</legend>
            <label htmlFor="walletUserEmailDelete">Email utilisateur</label>
            <input
              id="walletUserEmailDelete"
              name="userEmail"
              type="email"
              placeholder="exemple@domaine.com"
              value={userEmailToDelete}
              onChange={(e) => setUserEmailToDelete(e.target.value)}
              required
            />
            <button type="submit">Supprimer le Wallet</button>
            {msg.walletDelete && <p className={styles.msg}>{msg.walletDelete}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}