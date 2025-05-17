import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import Footer from './Footer';
import Navbar from './Navbar';
import Home from './Home';
import Menu from './Menu';
import Games from './Games';
import Queue from './Queue';
import Admin from './Admin';
import Login from './Login';
import Leaderboard from './Leaderboard';

function App() {
	const [shots, setShots] = useState([]);
	const [machines, setMachines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [authLoading, setAuthLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [cart, setCart] = useState([]);

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				setUser(firebaseUser);
				if (location.pathname === "/Login") {
					navigate("/");
				}
			} else {
				setUser(null);
				if (location.pathname !== "/Login") {
					navigate("/Login");
				}
			}
			setAuthLoading(false);
		});
		return () => unsubscribe();
	}, [navigate, location]);

	const fetchShots = async () => {
		try {
			const storedEtag = localStorage.getItem("shotsEtag");
			const storedShots = localStorage.getItem("shotsData");

			const response = await fetch(`/api/shots`, {
				headers: {
					"If-None-Match": storedEtag || ""
				}
			});

			if (response.status === 304) {
				// console.log("Les shots sont déjà à jour (304 Not Modified)");

				// Charger les shots depuis le localStorage
				if (storedShots) {
					setShots(JSON.parse(storedShots));
				}
				setLoading(false);
				return;
			}

			if (!response.ok) {
				const text = await response.text();
				console.error("Erreur HTTP:", response.status, response.statusText, text);

				// Fallback local en cas d'échec réseau
				if (storedShots) {
					setShots(JSON.parse(storedShots));
				}
				return;
			}

			const data = await response.json();
			setShots(data.shots);

			// Stocker le nouvel ETag et les données localement
			const newEtag = response.headers.get("ETag");
			if (newEtag) {
				localStorage.setItem("shotsEtag", newEtag);
			}
			localStorage.setItem("shotsData", JSON.stringify(data.shots));

			setLoading(false);
		} catch (error) {
			console.error("Erreur de connexion:", error);

			// Fallback en cas d'erreur réseau
			const storedShots = localStorage.getItem("shotsData");
			if (storedShots) {
				setShots(JSON.parse(storedShots));
			}
		}
	};

	const fetchMachines = async () => {
		try {
			const storedEtag = localStorage.getItem("machinesEtag");
			const storedMachines = localStorage.getItem("machinesData");

			const response = await fetch(`/api/machines`, {
				headers: {
					"If-None-Match": storedEtag || ""
				}
			});

			if (response.status === 304) {
				console.log("Les machines sont déjà à jour (304 Not Modified)");

				if (storedMachines) {
					setMachines(JSON.parse(storedMachines));
				}
				setLoading(false);
				return;
			}

			if (!response.ok) {
				const text = await response.text();
				console.error("Erreur HTTP:", response.status, response.statusText, text);

				if (storedMachines) {
					setMachines(JSON.parse(storedMachines));
				}
				setLoading(false);
				return;
			}

			const data = await response.json();
			setMachines(data.machines || data); // selon ce que renvoie ton API

			const newEtag = response.headers.get("ETag");
			if (newEtag) {
				localStorage.setItem("machinesEtag", newEtag);
			}
			localStorage.setItem("machinesData", JSON.stringify(data.machines || data));

			setLoading(false);
		} catch (error) {
			console.error("Erreur de connexion:", error);

			const fallback = localStorage.getItem("machinesData");
			if (fallback) {
				setMachines(JSON.parse(fallback));
			}
			setLoading(false);
		}
	};

	if (authLoading) {
		return <div>Chargement de l'utilisateur...</div>;
	}

	return (
		<div>
			{user && <Navbar user={user} />} {/* Navbar seulement si connecté */}
			<div className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/menu" element={<Menu shotState={{ shots, fetchShots }} machineState={{ machines, fetchMachines }} cartState={{ cart, setCart }} />} />
					<Route path="/games" element={<Games />} />
					<Route path="/queue" element={<Queue />} />
					<Route path="/admin" element={<Admin shotState={{ shots, fetchShots }} machineState={{ machines, fetchMachines }} />} />
					<Route path="/login" element={<Login />} />
					<Route path="/leaderboard" element={<Leaderboard />} />
				</Routes>
			</div>
			{user && <Footer />}
		</div>
	);
}

export default App;
