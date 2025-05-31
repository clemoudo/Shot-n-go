import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from "./Admin.module.css";

import ShotManagement from "./Management/ShotManagement";
import MachineManagement from "./Management/MachineManagement";
import MachineShotManagement from "./Management/MachineShotManagement";
import WalletManagement from "./Management/WalletManagement";
import CommandeManagement from "./Management/CommandeManagement";
import NewsManagement from "./Management/NewsManagement";


export default function Admin({ shotState, machineState, machineShotsState, walletState, commandeState, newsState }) {
  const { shots, fetchShots } = shotState;
  const { machines, fetchMachines } = machineState;
  const { machineShots, setMachineShots, fetchMachineShots } = machineShotsState;
  const { fetchWallet } = walletState;
  const { commandes, fetchCommandes } = commandeState;
  const { news, fetchNews } = newsState;

  const [windowForm, setWindowForm] = useState("wallet");

  // --- Gestion des messages (partagée) ---
  const [msg, setMsg] = useState({});
  function setMessage(dest, newMsg) {
    setMsg(prevMsg => ({ ...prevMsg, [dest]: newMsg }));
    // Optionnel: faire disparaître le message après un délai
    setTimeout(() => {
      setMsg(prevMsg => ({ ...prevMsg, [dest]: null }));
    }, 25000);
  }

  // --- Gestion des users (admin) ---
  const [isAdmin, setIsAdmin] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true); // Forcer le rafraîchissement
          const role = tokenResult.claims.role || "client";
          setIsAdmin(role === "admin");
          localStorage.setItem("token", tokenResult.token); // Bonne pratique de stocker le token à jour
        } catch (err) {
          console.error("Erreur rôle :", err);
          setIsAdmin(false);
          localStorage.removeItem("token");
        }
      } else {
        setIsAdmin(false);
        localStorage.removeItem("token");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleWindows = (e) => {
    setWindowForm(e.target.value);
  };

  if (isAdmin === null) return <p>Chargement des droits administrateur...</p>;
  if (!isAdmin) return <p>Accès refusé : vous n'avez pas les droits administrateur.</p>;

  return (
    <div className={styles.admin_panel}>
      <h1>Panneau Admin</h1>

      <select onChange={handleWindows} value={windowForm} className={styles.admin_nav_select}>
        <option value="wallet">Gestion des Wallets</option>
        <option value="commande">Gestion des Commandes</option>
        <option value="news">Gestion des News</option>
        <option value="shot">Gestion des Shots</option>
        <option value="machine">Gestion des Machines</option>
        <option value="machineShot">Liaison Machine-Shot</option>
      </select>

      <div className={styles.forms_wrapper}>
        {windowForm === "shot" && (
          <ShotManagement
            shots={shots}
            fetchShots={fetchShots}
            msg={msg}
            setMessage={setMessage}
          />
        )}
        {windowForm === "machine" && (
          <MachineManagement
            machines={machines}
            fetchMachines={fetchMachines}
            msg={msg}
            setMessage={setMessage}
          />
        )}
         {windowForm === "machineShot" && (
          <MachineShotManagement
            machines={machines}
            shots={shots}
            machineShots={machineShots}
            setMachineShots={setMachineShots}
            fetchMachineShots={fetchMachineShots}
            fetchMachines={fetchMachines}
            fetchShots={fetchShots}
            msg={msg}
            setMessage={setMessage}
          />
        )}
        {windowForm === "wallet" && (
          <WalletManagement
            fetchWallet={fetchWallet}
            msg={msg}
            setMessage={setMessage}
          />
        )}
        {windowForm === "commande" && (
          <CommandeManagement
            commandes={commandes}
            fetchCommandesInitial={fetchCommandes}
            msg={msg}
            setMessage={setMessage}
          />
        )}
        {windowForm === "news" && (
            <NewsManagement
                news={news}
                fetchNews={fetchNews}
                msg={msg}
                setMessage={setMessage}
            />
        )}
      </div>
    </div>
  );
}