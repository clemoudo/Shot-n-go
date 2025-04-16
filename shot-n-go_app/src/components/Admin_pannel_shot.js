import { useState,useEffect } from "react";

function Admin_pannel_shot({shots,setShots,loading,setLoading,fetchShots}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [alcoholLevel, setAlcoolLevel] = useState(0);
  const [category, setCategory] = useState("");
  const [sweetness, setSweetness] = useState(0);
  const [cover, setCover] = useState(null);  // Accepter un fichier pour l'image
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cover) {
      alert("Veuillez sélectionner une image");
      return;
    }

    const formData = new FormData();
    formData.append("file", cover);  // Ajouter le fichier 'cover' à FormData
    formData.append("name", name);
    formData.append("alcoholLevel", alcoholLevel);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("sweetness", sweetness);
    formData.append("stock",100)  

    try {
      // Envoi du fichier et des autres données dans une seule requête POST
      const response = await fetch("/api/shot/send/", {
        method: "POST",
        body: formData  // formData contenant l'image et les autres données
      })

      if (response.ok) {
        const data = await response.json();
        alert("Shot ajouté !");
        fetchShots();  // Actualiser la liste des shots
        console.log(`ajout du shot ${data}`);
      } else {
        alert("Erreur lors de l'ajout du shot.");
      }
    } catch (error) {
      console.error("Erreur d'upload ou de connexion :", error);
      alert("Erreur lors de l'ajout du shot.");
    }
  };
  const deleteShot = async (shot_name) => {
    try {
      const response = await fetch(`/api/shot/supr/{shot_name}`, { method: "DELETE" });
      if (response.ok) {
        alert("Shot supprimé !");
        fetchShots();
      } else {
        alert("Shot introuvable.");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur.");
    }
  };


  useEffect(() => {
    fetchShots();
    const intervalId = setInterval(fetchShots, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto bg-gray-50 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ajouter un Shot</h2>
      <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-xl shadow-lg space-y-4">
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" placeholder="Sweetness" value={sweetness} max={3} min={1} onChange={(e) => setSweetness(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" placeholder="Alcool Level" value={alcoholLevel} max={3} min={1} onChange={(e) => setAlcoolLevel(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="text" placeholder="Category" value={category}  onChange={(e) => setCategory(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" placeholder="prix" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" type="file" onChange={(e) => setCover(e.target.files[0])} />
        <button type="submit" className="w-full bg-gray-800 text-black p-3 rounded-lg hover:bg-gray-900">Ajouter</button>
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
                <p className="text-sm text-gray-500">categorie : {shot.category} - niveau d'alcool: {shot.alcoholLevel}/3 - Sweetness: {shot.sweetness}/3 - prix: {(shot.price).toFixed(2)}€</p>
                {shot.cover && (
                  <img 
                    src={`data:image/jpeg;base64,${shot.cover}`} 
                    alt="Cover" 
                    style={{ width: 100, height: 100 }}
                  />
                )}  
            </div>
              <button onClick={() => deleteShot(shot.name)} className="bg-red-500 text-black px-4 py-2 rounded-lg hover:bg-red-700">Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin_pannel_shot;