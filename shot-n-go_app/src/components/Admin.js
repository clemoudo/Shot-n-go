import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../styles/Admin.css";
import axios from "axios";

export default function Admin({ shotState, machineState, machineShotsState }) {
  const { shots, fetchShots } = shotState;
  const { machines, fetchMachines } = machineState;
  const { machineShots, setMachineShots, fetchMachineShots } = machineShotsState;
  const [windowForm, setWindowForm] = useState("shot")

  // --- Gestion des messages ---
  const [msg, setMsg] = useState({
    shotAdd: "",
    shotDelete: "",
    machineAdd: "",
    machineDelete: "",
    machineShotAdd: "",
    machineShotDelete: ""
  });

  function setMsgShotAdd(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      shotAdd: newMsg
    }));
  }

  function setMsgShotDelete(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      shotDelete: newMsg
    }));
  }

  function setMsgMachineAdd(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      machineAdd: newMsg
    }));
  }

  function setMsgMachineDelete(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      machineDelete: newMsg
    }));
  }

  function setMsgMachineShotAdd(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      machineShotAdd: newMsg
    }));
  }

  function setMsgMachineShotDelete(newMsg) {
    setMsg(prevMsg => ({
      ...prevMsg,
      machineShotDelete: newMsg
    }));
  }

  // --- Modèle des éléments à ajouter ---
  const [newShot, setNewShot] = useState({
    name: "",
    price: "",
    image: "",
    category: ""
  });
  const [newMachine, setNewMachine] = useState({ 
    name: "" 
  });

  // Pour l'ajout d'image dans le form de l'ajout des shots
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // --- Gestion des users (admin) ---
  const [isAdmin, setIsAdmin] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          const role = tokenResult.claims.role || "client";
          setIsAdmin(role === "admin");
          localStorage.setItem("token", tokenResult.token);
        } catch (err) {
          console.error("Erreur rôle :", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch lors du chargement du composant
  useEffect(() => {
    fetchShots();
    fetchMachines();
  }, []);

  // --- Gestion de la page à afficher ---
  const handleWindows = (e) => {
    setWindowForm(e.target.value)
  }

  // --- Gestion des images ---
  const uploadImage = async () => {
    const token = localStorage.getItem("token");
    if (!file || !token) return;

    try {
      const formData = new FormData();
      formData.append("file", file[0]);

      await axios.post(`/images/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload échoué :", err);
    }
  };

  const deleteImage = async (filename) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`/images/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Erreur suppression image :", err);
    }
  };

  // --- Gestion des shots ---
  const handleDeleteShot = async (id, image) => {
    const token = localStorage.getItem("token");

    if (!window.confirm(`Supprimer le shot "${id}" et son image "${image}" ?`)) return;
    try {
      await axios.delete(`/api/shots/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      deleteImage(image);
      setMsgShotDelete(`Shot "${id}" et image "${image}" supprimés`);
      fetchShots();
    } catch (err) {
      console.error("Erreur suppression shot :", err);
      setMsgShotDelete(`Échec de la suppression du shot "${id}" et de l'image "${image}"`);
    }
  };

  const handleNewShotChange = (e) => {
    const { name, value} = e.target;
    setNewShot((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewImageChange = (e) => {
    const { files } = e.target;
    setFile(files);

    const imageUrl = files[0].name;
    setNewShot((prev) => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleNewShotSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(newShot).forEach(([key, val]) => {
      formData.append(key, val);
    })

    try {
      await axios.post("/api/shots", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      uploadImage();

      setMsgShotAdd(`Shot "${newShot.name}" et image "${newShot.image}" ajoutés !`);
      setNewShot({
        name: "",
        price: "",
        image: "",
        category: ""
      });
      fetchShots();

    } catch (err) {
      console.error("Erreur envoi shot :", err);
      setMsgShotAdd(`Erreur lors de l'ajout du shot "${newShot.name}" et de l'image "${newShot.image}"`);
    }
  };

  // --- Gestion des machines ---
  const handleNewMachineChange = (e) => {
    setNewMachine({ name: e.target.value });
  };

  const handleNewMachineSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newMachine.name);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur");

      setMsgMachineAdd("Machine ajoutée");
      setNewMachine({ name: "" });
      fetchMachines(); // à implémenter
    } catch (err) {
      setMsgMachineAdd("Erreur ajout");
    }
  };

  const handleDeleteMachine = async (machineId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/machines/${machineId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur");

      setMsgMachineDelete(`${data.message}`);
      fetchMachines(); // refresh list
    } catch (err) {
      setMsgMachineDelete("Erreur suppression");
    }
  };

  // --- Gestion des relations machine-shot ---
  const handleNewMachineShotSubmit = async (machineId, shotId, stock) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("stock", stock);

    try {
      const response = await axios.post(`/api/machines/${machineId}/shots/${shotId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Récupère le message de succès depuis la réponse
      const successMsg = response.data.message;
      setMsgMachineShotAdd(successMsg);

    } catch (err) {
      console.error("Erreur envoi shot :", err);
      const details = err.response?.data?.detail;
      setMsgMachineShotAdd(details);
    }
  };

  const handleDeleteMachineShot = async (machineId, shotId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm(`Supprimer le shot "${shotId}" de la machine "${machineId}" ?`)) return;
    try {
      const response = await axios.delete(`/api/machines/${machineId}/shots/${shotId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const successMsg = response.data.message;
      setMsgMachineShotDelete(successMsg);
    } catch (err) {
      console.error("Erreur suppression shot :", err);
      const details = err.response?.data?.detail;
      setMsgMachineShotDelete(details);
    }
  }

  if (isAdmin === null) return <p>Chargement...</p>;
  if (!isAdmin) return <p>Accès refusé : vous n'avez pas les droits administrateur.</p>;

  return (
    <div className="admin-panel">
      <h1>Panneau Admin</h1>

      <select onChange={handleWindows}>
        <option value="shot">Shot</option>
        <option value="machine">Machine</option>
        <option value="machineShot">Machine-Shot</option>
      </select>

      <div className="forms-wrapper">
        {windowForm === "shot" && (<>
          {/* Ajouter un shot */}
          <section className="form-container new-form">
            <form onSubmit={handleNewShotSubmit}>
              <fieldset>
                <legend>Ajouter un Shot</legend>
                <label>Nom</label>
                <input name="name" placeholder="Nom" type="text" value={newShot.name} onChange={handleNewShotChange} required />
                <label>Prix (€)</label>
                <input name="price" placeholder="Prix" type="number" min="0" max="100" step="0.01" value={newShot.price} onChange={handleNewShotChange} required />
                <label>Catégorie</label>
                <input name="category" placeholder="Catégorie" type="text" value={newShot.category} onChange={handleNewShotChange} required />
                <label>Image</label>
                <input name="file" type="file" ref={fileInputRef} onChange={handleNewImageChange} required />
                <button type="submit">Ajouter Shot</button>
                {msg.shotAdd && <p className="msg">{msg.shotAdd}</p>}
              </fieldset>
            </form>
          </section>

          {/* Supprimer un shot */}
          <section className="form-container delete-form">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const { id, image } = JSON.parse(e.target.elements.shotData.value);
                handleDeleteShot(id, image);
              }}
            >
              <fieldset>
                <legend>Supprimer un Shot</legend>
                <label htmlFor="shotData">Sélectionnez un shot à supprimer</label>
                <select name="shotData" id="shotData" required>
                  <option value="">-- Choisir un shot --</option>
                  {shots.map((shot) => (
                    <option key={shot.id} value={JSON.stringify({ id: shot.id, image: shot.image })}>
                      {shot.id} {shot.name}
                    </option>
                  ))}
                </select>
                <button type="submit">Supprimer Shot</button>
                {msg.shotDelete && <p className="msg">{msg.shotDelete}</p>}
              </fieldset>
            </form>
          </section>
        </>)}

        {windowForm === "machine" && (<>
          {/* Ajouter une machine */}
          <section className="form-container new-form">
            <form onSubmit={handleNewMachineSubmit}>
              <fieldset>
                <legend>Ajouter une Machine</legend>
                <label>Nom</label>
                <input
                  name="name"
                  placeholder="Nom"
                  type="text"
                  value={newMachine.name}
                  onChange={handleNewMachineChange}
                  required
                />
                <button type="submit">Ajouter Machine</button>
                {msg.machineAdd && <p className="msg">{msg.machineAdd}</p>}
              </fieldset>
            </form>
          </section>

          {/* Supprimer une machine */}
          <section className="form-container delete-form">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const machineId = parseInt(e.target.elements.machineId.value);
                handleDeleteMachine(machineId);
              }}
            >
              <fieldset>
                <legend>Supprimer une Machine</legend>
                <label htmlFor="machineId">Sélectionnez une machine à supprimer</label>
                <select name="machineId" id="machineId" required>
                  <option value="">-- Choisir une machine --</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.id} {machine.name}
                    </option>
                  ))}
                </select>
                <button type="submit">Supprimer Machine</button>
                {msg.machineDelete && <p className="msg">{msg.machineDelete}</p>}
              </fieldset>
            </form>
          </section>
        </>)}

        {windowForm === "machineShot" && (<>
          {/* Ajouter un shot à une machine */}
          <section className="form-container new-form">
            <form onSubmit={(e) => {
              e.preventDefault();
              const machineId = parseInt(e.target.elements.machineId.value);
              const shotId = parseInt(e.target.elements.shotId.value);
              const stock = parseFloat(e.target.elements.stock.value);
              handleNewMachineShotSubmit(machineId, shotId, stock);
            }}>
              <fieldset>
                <legend>Ajouter un shot à une machine</legend>
                <label>Id machine</label>
                <select
                  name="machineId"
                  placeholder="Id machine"
                  type="text"
                  required
                >
                  <option value="">-- Choisir une machine --</option>
                  {machines.map((machine) => (
                    <option key={`m${machine.id}`} value={machine.id}>
                      {machine.id} {machine.name}
                    </option>
                  ))}
                </select>
                <label>Id shot</label>
                <select
                  name="shotId"
                  placeholder="Id shot"
                  type="text"
                  required
                >
                  <option value="">-- Choisir un shot --</option>
                  {shots.map((shot) => (
                    <option key={`s${shot.id}`} value={shot.id}>
                      {shot.id} {shot.name}
                    </option>
                  ))}
                </select>
                <label>Stock (%)</label>
                <input name="stock" placeholder="Stock" type="number" min="0" max="1" step="0.01" required />
                <button type="submit">Ajouter shot</button>
                {msg.machineShotAdd && <p className="msg">{msg.machineShotAdd}</p>}
              </fieldset>
            </form>
          </section>

          {/* Supprimer un shot d'une machine */}
          <section className="form-container delete-form">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const machineId = parseInt(e.target.elements.machineId.value);
                const shotId = parseInt(e.target.elements.shotId.value);
                handleDeleteMachineShot(machineId, shotId);
              }}
            >
              <fieldset>
                <legend>Supprimer un shot à une machine</legend>
                <label>Id machine</label>
                <select
                  name="machineId"
                  placeholder="Id machine"
                  type="text"
                  onChange={(e) => {
                    if(!e.target.value){
                      setMachineShots([]);
                      return;
                    }
                    fetchMachineShots(e.target.value)}}
                  required
                >
                  <option value="">-- Choisir une machine --</option>
                  {machines.map((machine) => (
                    <option key={`m${machine.id}`} value={machine.id}>
                      {machine.id} {machine.name}
                    </option>
                  ))}
                </select>
                <label>Id shot</label>
                <select
                  name="shotId"
                  placeholder="Id shot"
                  type="text"
                  required
                >
                  <option value="">-- Choisir un shot --</option>
                  {machineShots.shots && machineShots.shots.map((shot) => (
                    <option key={`s${shot.id}`} value={shot.id}>
                      {shot.id} {shot.name}
                    </option>
                  ))}
                </select>
                <button type="submit">Supprimer Machine</button>
                {msg.machineShotDelete && <p className="msg">{msg.machineShotDelete}</p>}
              </fieldset>
            </form>
          </section>
        </>)}
      </div>
    </div>
  );
}
