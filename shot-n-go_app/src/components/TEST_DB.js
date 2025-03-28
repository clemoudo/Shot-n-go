import { useState, useEffect } from "react";

function TEST_DB() {
  const [name, setName] = useState("");
  const [alcoholLevel, setAlcoolLevel] = useState(0);
  const [category, setCategory] = useState("");
  const [sweetness,setSweetness] = useState(0)
  const [shots, setShots] = useState([]); // État pour les utilisateurs
  const [loading, setLoading] = useState(true); // État de chargement

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Crée un objet user à envoyer à l'API
    const shot = {
      name: name,
      alcoholLevel : alcoholLevel,
      category : category,
      sweetness : sweetness
    };

    try {
      // Envoie la requête POST au back-end FastAPI
      const response = await fetch("http://54.36.181.67:8000/add_shot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Déclare que les données envoyées sont en JSON
        },
        body: JSON.stringify(shot), // Transforme l'objet JavaScript en JSON
      });

      // Vérifie si la requête a réussi
      if (response.ok) {
        const data = await response.json();
        console.log("Utilisateur ajouté avec ID:", data.user_id);
        alert("Utilisateur ajouté !");
        fetchUsers(); // Rafraîchir la liste des utilisateurs après l'ajout
      } else {
        console.error("Erreur lors de l'ajout de l'utilisateur.");
        alert("Erreur lors de l'ajout de l'utilisateur.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur.");
    }
  };

  const deleteUser = async (shot_name) => {
    try {
      const response = await fetch(`http://54.36.181.67:8000/delete_shot/${shot_name}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        console.log(`Shot ${shot_name} supprimé`);
        alert("Utilisateur supprimé !");
        fetchUsers(); // Rafraîchir la liste après suppression
      } else {
        console.error("Erreur lors de la suppression.");
        alert("Utilisateur introuvable.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur.");
    }
  };
  // Fonction pour récupérer les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://54.36.181.67:8000/get_shots/");
      if (response.ok) {
        const data = await response.json();
        setShots(data.shots); // Met à jour les utilisateurs dans l'état
        setLoading(false); // Arrête le chargement
      } else {
        console.error("Erreur lors de la récupération des utilisateurs.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  // Utilisation de useEffect pour charger les utilisateurs au démarrage
  useEffect(() => {
    fetchUsers(); // Appeler fetchUsers immédiatement après le premier rendu

    // Mettre en place un intervalle pour récupérer les utilisateurs toutes les 5 secondes
    const intervalId = setInterval(fetchUsers, 10000); // Rafraîchir toutes les 5 secondes

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div>Chargement des utilisateurs...</div>;
  }

  return (
    <div>
      <h2>Ajouter un utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sweetness"
          value={sweetness}
          onChange={(e) => setSweetness(e.target.value)}
        />
        <input
          type="number"
          placeholder="Alcool Level"
          value={alcoholLevel}
          onChange={(e) => setAlcoolLevel(e.target.value)}
        />
        <input
          type="txt"
          placeholder="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>

      <h2>Liste des utilisateurs</h2>
      {shots.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <ul>
          {shots.map((shot, index) => (
            <li key={index}>
              <strong>{shot.name}</strong> ({shot.alcoholLevel}) - {shot.category} - {shot.sweetness} 
              <button onClick={() => deleteUser(shot.name)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TEST_DB;
