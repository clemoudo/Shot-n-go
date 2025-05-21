import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

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
	const [machineShots, setMachineShots] = useState([]);
	const [wallet, setWallet] = useState(0);
	const [commandes, setCommandes] = useState([]);
	const [queue, setQueue] = useState([]);
	const [leaderboard, setLeaderboard] = useState([]);

	const [loading, setLoading] = useState(true);
	const [authLoading, setAuthLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [cart, setCart] = useState([]);

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				setUser(firebaseUser);
				
				// Récupérer le token ID Firebase
				const token = await firebaseUser.getIdToken();
				localStorage.setItem("token", token);

				if (location.pathname === "/Login") {
				navigate("/");
				}
			} else {
				setUser(null);
				localStorage.removeItem("token");

				if (location.pathname !== "/Login") {
				navigate("/Login");
				}
			}
			setAuthLoading(false);
		});
		return () => unsubscribe();
		}, [navigate, location]);

	const fetchWithCache = async (key, url, setData) => {
		const token = localStorage.getItem("token");
		try {
			const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
			const storedEtag = localStorage.getItem(`${key}Etag`);
			const storedData = localStorage.getItem(`${key}Data`);

			const response = await axios.get(url, {
				headers: {
					"If-None-Match": storedEtag || "",
					Authorization: `Bearer ${token}`
				}
			});
			if (response.status === 304) {
				if (storedData) {
					setData(JSON.parse(storedData));
				}
				setLoading(false);
				return;
			}

			if (response.status < 200 || response.status >= 300) {
				console.error(`Erreur HTTP (${capitalized}):`, response.status, response.statusText);
				if (storedData) {
					setData(JSON.parse(storedData));
				}
				setLoading(false);
				return;
			}

			const data = response.data;
			const extractedData = data[key] || data; // gère les réponses de type { shots: [...] } ou juste [...]

			setData(extractedData);

			const newEtag = response.headers["etag"];
			if (newEtag) {
				localStorage.setItem(`${key}Etag`, newEtag);
			}
			localStorage.setItem(`${key}Data`, JSON.stringify(extractedData));

			setLoading(false);
		} catch (error) {
			// console.error(`Erreur de connexion (${key}) :`, error);

			const fallback = localStorage.getItem(`${key}Data`);
			if (fallback) {
				setData(JSON.parse(fallback));
			}
			setLoading(false);
		}
	};

	const fetchShots = () => {
		fetchWithCache("shots", "/api/shots", setShots)
	}

	const fetchMachines = () => {
		fetchWithCache("machines", "/api/machines", setMachines)
	}

	const fetchMachineShots = (machineId) => {
		fetchWithCache(`machine:${machineId}:shots`, `/api/machines/${machineId}/shots`, setMachineShots)
	}

	const fetchWallet = () => {
		fetchWithCache(`wallet:credit`, `/api/wallets/credit`, setWallet)
	}
	
	const fetchCommandes = (state) => {
		const key = `commandes_${state}`;
		fetchWithCache(key, `/api/commandes?state=${encodeURIComponent(state)}`, setCommandes);
	}

	const fetchQueue = (machineId) => {
		fetchWithCache(`machine:${machineId}:queue`, `/api/machines/${machineId}/queue`, setQueue);
	}

	const fetchLeaderboard = () => {
		fetchWithCache(`leaderboard:total_shot`, `/api/leaderboard`, setLeaderboard);
	}

	useEffect(() => {
		fetchMachines();
  	}, []);

	useEffect(() => {
		machines[0] && fetchMachineShots(machines[0]?.id);
	}, [machines])

	if (authLoading) {
		return <div>Chargement de l'utilisateur...</div>;
	}

	return (
		<div>
			{/* Navbar seulement si connecté */}
			{user && 
				<Navbar 
					user={user}
					walletState={{ wallet, fetchWallet }}
				/>
			}
			<div className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/menu" element={<Menu 
						machineState={{ machines, fetchMachines }} 
						machineShotsState={{ machineShots, fetchMachineShots }} 
						cartState={{ cart, setCart }} 
						walletState={{ wallet, fetchWallet }}
					/>} />
					<Route path="/games" element={<Games />} />
					<Route path="/queue" element={<Queue
						queueState={{ queue, fetchQueue }}  
						machineState={{ machines, fetchMachines }}
					/>} />
					<Route path="/admin" element={<Admin 
						shotState={{ shots, fetchShots }} 
						machineState={{ machines, fetchMachines }} 
						machineShotsState={{ machineShots, setMachineShots, fetchMachineShots }} 
						walletState={{ wallet, fetchWallet }} 
						commandeState={{ commandes, fetchCommandes }} 
					/>} />
					<Route path="/login" element={<Login />} />
					<Route path="/leaderboard" element={<Leaderboard
						leaderboardState={{ leaderboard, fetchLeaderboard }}
					/>} />
				</Routes>
			</div>
			{user && <Footer />}
		</div>
	);
}

export default App;
