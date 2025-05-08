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
import Admin_pannel from './Admin_pannel';
import Login from './Login';
import Leaderboard from './Leaderboard';

function App() {
	const [shots, setShots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [authLoading, setAuthLoading] = useState(true);
	const [user, setUser] = useState(null);

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
			const response = await fetch("/api/shot/receive/");
			if (!response.ok) {
				const text = await response.text();
				console.error("Erreur HTTP:", response.status, response.statusText, text);
				return;
			}

			const data = await response.json();
			console.log("Shots récupérés :", data.shots);
			setShots(data.shots);
			setLoading(false);
		} catch (error) {
			console.error("Erreur de connexion:", error);
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
					<Route path="/menu" element={<Menu shots={shots} fetchShots={fetchShots} />} />
					<Route path="/games" element={<Games />} />
					<Route path="/Queue" element={<Queue />} />
					<Route path="/Admin_pannel" element={<Admin_pannel shots={shots} setShots={setShots} loading={loading} setLoading={setLoading} fetchShots={fetchShots} />} />
					<Route path="/Login" element={<Login />} />
					<Route path="/leaderboard" element={<Leaderboard />} />
				</Routes>
			</div>
			<Footer />
		</div>
	);
}

export default App;
