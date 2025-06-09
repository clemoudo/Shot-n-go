import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation, Navigate } from "react-router-dom"; // Added Navigate
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

import Footer from './Footer/Footer';
import Navbar from './Navbar/Navbar';
import Home from './Home/Home';
import Menu from './Menu/Menu';
import Games from './Games/Games';
import Queue from './Queue/Queue';
import Admin from './Admin/Admin';
import Login from './Login/Login';
import Leaderboard from './Leaderboard/Leaderboard';
import VerifyEmail from './Login/VerifyEmail';

function App() {
    const [shots, setShots] = useState([]);
    const [machines, setMachines] = useState([]);
    const [machineShots, setMachineShots] = useState([]);
    const [wallet, setWallet] = useState(0);
    const [commandes, setCommandes] = useState([]);
    const [queue, setQueue] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [news, setNews] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState("");

    const [authLoading, setAuthLoading] = useState(true); // Pour le chargement de l'état d'auth
    const [user, setUser] = useState(null);


    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setAuthLoading(true); // Mettre à jour l'état de chargement au début
            if (firebaseUser) {
                // Forcer le rechargement de l'état de l'utilisateur pour obtenir le statut emailVerified à jour
                // Surtout utile si l'utilisateur vérifie son email et revient sur l'onglet
                await firebaseUser.reload();
                const freshUser = auth.currentUser; // Obtenir l'utilisateur rafraîchi
                setUser(freshUser);

                if (freshUser.emailVerified) {
                    const token = await freshUser.getIdToken();
                    localStorage.setItem("token", token);
                    // Si l'utilisateur est vérifié et sur Login ou VerifyEmail, rediriger vers l'accueil
                    if (location.pathname === "/login" || location.pathname === "/verify-email") {
                        navigate("/");
                    }
                    // Les données seront chargées par les useEffect dépendant de 'user' plus bas
                } else {
                    // Utilisateur connecté mais email non vérifié
                    setUser(freshUser); // Mettre à jour l'utilisateur pour que VerifyEmail puisse l'utiliser
                    localStorage.removeItem("token"); // Pas de token pour les actions API si non vérifié
                    if (location.pathname !== "/verify-email" && location.pathname !== "/login") {
                        navigate("/verify-email");
                    }
                }
            } else {
                // Utilisateur non connecté
                setUser(null);
                localStorage.removeItem("token");
                const allowedPaths = ["/login", "/verify-email"];
                if (!allowedPaths.includes(location.pathname)) {
                    navigate("/login");
                }
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [navigate, location.pathname]); // Ajouter location.pathname pour réévaluer si besoin

    // --- Fonctions Fetch (inchangées en elles-mêmes) ---
    const fetchWithCache = async (key, url, setData) => {
        const token = localStorage.getItem("token");
        // Important: Si pas de token (parce que non vérifié ou déconnecté), ne pas faire l'appel
        if (!token && !url.includes('/api/news')) { // Les news pourraient être publiques
             // console.log(`Fetch pour ${key} annulé: token manquant ou utilisateur non vérifié.`);
             // setLoading(false); // Assurez-vous que loading est géré
             // return;
        }

        try {
            // ... (reste de la logique fetchWithCache)
            // Assurez-vous que les headers Authorization ne sont envoyés que si token existe
            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const storedEtag = localStorage.getItem(`${key}Etag`);
            if (storedEtag) {
                headers["If-None-Match"] = storedEtag;
            }

            const response = await axios.get(url, { headers });
            // ... (reste de la logique fetchWithCache)
            const capitalized = key.charAt(0).toUpperCase() + key.slice(1);

			if (response.status === 304) {
				const storedData = localStorage.getItem(`${key}Data`);
				if (storedData) {
					setData(JSON.parse(storedData));
				}
				// setLoading(false); // Attention à ne pas appeler setLoading trop tôt si plusieurs fetchs
				return;
			}

			if (response.status < 200 || response.status >= 300) {
				console.error(`Erreur HTTP (${capitalized}):`, response.status, response.statusText);
				const storedData = localStorage.getItem(`${key}Data`);
				if (storedData) {
					setData(JSON.parse(storedData));
				}
				// setLoading(false);
				return;
			}

			const data = response.data;
			const extractedData = data[key] || data;

			setData(extractedData);

			const newEtag = response.headers["etag"];
			if (newEtag) {
				localStorage.setItem(`${key}Etag`, newEtag);
			}
			localStorage.setItem(`${key}Data`, JSON.stringify(extractedData));

        } catch (error) {
            // console.error(`Erreur de connexion (${key}) :`, error);
            const fallback = localStorage.getItem(`${key}Data`);
            if (fallback) {
                setData(JSON.parse(fallback));
            }
        } finally {
            // setLoading(false); // Gérer setLoading globalement après tous les fetchs initiaux si nécessaire
        }
    };

    // Déclarez les fonctions fetch ici...
    const fetchShots = () => fetchWithCache("shots", "/api/shots", setShots);
    const fetchMachines = () => fetchWithCache("machines", "/api/machines", setMachines);
    const fetchMachineShots = (machineId) => fetchWithCache(`machine:${machineId}:shots`, `/api/machines/${machineId}/shots`, setMachineShots);
    const fetchWallet = () => user && user.uid && fetchWithCache(`wallet:${user.uid}:credit`, `/api/wallets/credit`, setWallet);
    const fetchCommandes = (state) => fetchWithCache(`commandes_${state}`, `/api/commandes?state=${encodeURIComponent(state)}`, setCommandes);
    const fetchQueue = (machineId) => fetchWithCache(`machine:${machineId}:queue`, `/api/machines/${machineId}/queue`, setQueue);
    const fetchLeaderboard = () => fetchWithCache(`leaderboard:total_shot`, `/api/leaderboard`, setLeaderboard);
    const fetchNews = () => fetchWithCache(`news`, `/api/news`, setNews); // Les news pourraient être publiques

    if (authLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Chargement de l'authentification...</div>;
    }

    return (
        <div>
            {/* 4. Navbar et Footer seulement si connecté ET vérifié */}
            {user && user.emailVerified && location.pathname !== "/login" && location.pathname !== "/verify-email" &&
                <Navbar
                    user={user}
                    walletState={{ wallet, fetchWallet }}
                />
            }
            <div className="main-container">
                <Routes>
                    {/* Routes publiques ou semi-publiques */}
                    <Route path="/login" element={user && user.emailVerified ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/verify-email" element={user && user.emailVerified ? <Navigate to="/" replace /> : <VerifyEmail />} />

                    {/* Routes protégées : accessibles seulement si user && user.emailVerified */}
                    {/* La redirection est gérée globalement par le useEffect de onAuthStateChanged */}
                    <Route path="/" element={user && user.emailVerified ? <Home newsState={{ news, fetchNews }} /> : <Navigate to="/login" replace />} />
                    <Route path="/menu" element={user && user.emailVerified ? <Menu
                        machineState={{ machines, fetchMachines }}
                        machineShotsState={{ machineShots, fetchMachineShots }}
                        cartState={{ cart, setCart }}
                        walletState={{ wallet, fetchWallet }}
                        selectedMachineIdState={{ selectedMachineId, setSelectedMachineId }}
                    /> : <Navigate to="/login" replace />} />
                    <Route path="/games" element={user && user.emailVerified ? <Games /> : <Navigate to="/login" replace />} />
                    <Route path="/queue" element={user && user.emailVerified ? <Queue
                        queueState={{ queue, fetchQueue }}
                        machineState={{ machines, fetchMachines }}
                    /> : <Navigate to="/login" replace />} />
                    <Route path="/admin" element={user && user.emailVerified ? <Admin
                        shotState={{ shots, fetchShots }}
                        machineState={{ machines, fetchMachines }}
                        machineShotsState={{ machineShots, setMachineShots, fetchMachineShots }}
                        walletState={{ wallet, fetchWallet }}
                        commandeState={{ commandes, fetchCommandes }}
                        newsState={{ news, fetchNews }}
                    /> : <Navigate to="/login" replace />} />
                    <Route path="/leaderboard" element={user && user.emailVerified ? <Leaderboard
                        leaderboardState={{ leaderboard, fetchLeaderboard }}
                    /> : <Navigate to="/login" replace />} />
                    
                    {/* Fallback pour les routes non trouvées */}
                    <Route path="*" element={<Navigate to={user && user.emailVerified ? "/" : "/login"} replace />} />
                </Routes>
            </div>
            {user && user.emailVerified && location.pathname !== "/login" && location.pathname !== "/verify-email" && <Footer />}
        </div>
    );
}

export default App;