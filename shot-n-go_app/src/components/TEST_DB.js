import { useState, useEffect } from "react";

function TEST_DB() {
  const [name, setName] = useState("");
  const [alcoholLevel, setAlcoolLevel] = useState(0);
  const [category, setCategory] = useState("");
  const [sweetness, setSweetness] = useState(0);
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shot = { name, alcoholLevel, category, sweetness };

    try {
      const response = await fetch("http://54.36.181.67:8000/add_shot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shot),
      });

      if (response.ok) {
        alert("Shot ajouté !");
        fetchUsers();
      } else {
        alert("Erreur lors de l'ajout du shot.");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur.");
    }
  };

  const deleteUser = async (shot_name) => {
    try {
      const response = await fetch(`http://54.36.181.67:8000/delete_shot/${shot_name}`, { method: "DELETE" });
      if (response.ok) {
        alert("Shot supprimé !");
        fetchUsers();
      } else {
        alert("Shot introuvable.");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur.");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://54.36.181.67:8000/get_shots/");
      if (response.ok) {
        const data = await response.json();
        setShots(data.shots);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    const intervalId = setInterval(fetchUsers, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto bg-gray-50 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ajouter un Shot</h2>
      <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-xl shadow-lg space-y-4">
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" placeholder="Sweetness" value={sweetness} onChange={(e) => setSweetness(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" placeholder="Alcool Level" value={alcoholLevel} onChange={(e) => setAlcoolLevel(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <button type="submit" className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900">Ajouter</button>
      </form>

      <h2 className="text-3xl font-semibold text-gray-800 mt-10 mb-6">Liste des Shots</h2>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="w-full grid grid-cols-1 gap-4">
          {shots.map((shot, index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-700">{shot.name}</h3>
                <p className="text-sm text-gray-500">{shot.category} - {shot.alcoholLevel}% - Sweetness: {shot.sweetness}</p>
              </div>
              <button onClick={() => deleteUser(shot.name)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TEST_DB;
