import { useState } from "react";
import styles from "../Admin.module.css";
import axios from "axios";

export default function WalletManagement({ fetchWallet, msg, setMessage }) { // fetchWallet est pour Admin.js, ici on ne l'utilise pas directement pour afficher
  const [userEmailToAdd, setUserEmailToAdd] = useState("");
  const [amountToAdd, setAmountToAdd] = useState("");
  const [userEmailToReset, setUserEmailToReset] = useState("");


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

  const handleResetWallet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
     if (!userEmailToReset.trim()) {
        setMessage("walletReset", "Veuillez entrer un email pour la suppression.");
        return;
    }

    if (!window.confirm(`Reset le wallet de "${userEmailToReset}" ? Cette action est irréversible.`)) return;

    try {
      const response = await axios.patch(`/api/wallets/${userEmailToReset}/reset-credits`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("walletReset", response.data.message || "Wallet remis à 0.");
      setUserEmailToReset("");
      if(fetchWallet) fetchWallet();
    } catch (err) {
      console.error("Erreur reset wallet:", err);
      setMessage("walletReset", `Erreur: ${err.response?.data?.detail || err.message}`);
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

      {/* Reset un wallet */}
      <section className={`${styles.form_container} ${styles.delete_form}`}>
        <form onSubmit={handleResetWallet}>
          <fieldset>
            <legend>Reset un Wallet</legend>
            <label htmlFor="walletUserEmailDelete">Email utilisateur</label>
            <input
              id="walletUserEmailDelete"
              name="userEmail"
              type="email"
              placeholder="exemple@domaine.com"
              value={userEmailToReset}
              onChange={(e) => setUserEmailToReset(e.target.value)}
              required
            />
            <button type="submit">Reset le Wallet</button>
            {msg.walletReset && <p className={styles.msg}>{msg.walletReset}</p>}
          </fieldset>
        </form>
      </section>
    </>
  );
}