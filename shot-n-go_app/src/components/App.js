import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation, Navigate } from "react-router-dom"; // Added Navigate
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
import VerifyEmail from './VerifyEmail'; // 1. Importer VerifyEmail

function App() {
    const [shots, setShots] = useState([]);
    const [machines, setMachines] = useState([]);
    const [machineShots, setMachineShots] = useState([]);
    const [wallet, setWallet] = useState(0);
    const [commandes, setCommandes] = useState([]);
    const [queue, setQueue] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [news, setNews] = useState([]);

    const [loading, setLoading] = useState(true); // Pour le chargement des données
    const [authLoading, setAuthLoading] = useState(true); // Pour le chargement de l'état d'auth
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    // 2. Modifier onAuthStateChanged
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
                    if (location.pathname === "/Login" || location.pathname === "/verify-email") {
                        navigate("/");
                    }
                    // Les données seront chargées par les useEffect dépendant de 'user' plus bas
                } else {
                    // Utilisateur connecté mais email non vérifié
                    setUser(freshUser); // Mettre à jour l'utilisateur pour que VerifyEmail puisse l'utiliser
                    localStorage.removeItem("token"); // Pas de token pour les actions API si non vérifié
                    if (location.pathname !== "/verify-email" && location.pathname !== "/Login") {
                        navigate("/verify-email");
                    }
                }
            } else {
                // Utilisateur non connecté
                setUser(null);
                localStorage.removeItem("token");
                const allowedPaths = ["/Login", "/verify-email"];
                if (!allowedPaths.includes(location.pathname)) {
                    navigate("/Login");
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

    // 5. Conditionner les appels fetch initiaux
    useEffect(() => {
        if (user && user.emailVerified) {
            setLoading(true); // Début du chargement des données
            Promise.all([ // Exécutez les fetchs initiaux en parallèle
                fetchMachines(),
                fetchNews(), // Les news pourraient être chargées même si non loggué, à vous de voir
                // Ajoutez d'autres fetchs initiaux ici si nécessaire
            ]).then(() => {
                setLoading(false); // Fin du chargement des données
            }).catch(() => {
                setLoading(false); // Gérer les erreurs de chargement
            });
        } else {
            // Si l'utilisateur n'est pas connecté ou vérifié, vider les données potentiellement sensibles
            setMachines([]);
            setShots([]);
            // ... réinitialiser d'autres états ...
            setLoading(false); // Pas de données à charger
        }
    }, [user]); // Se déclenche quand user change (connexion, déconnexion, vérification)

    useEffect(() => {
        // Ce fetch dépend de 'machines' et donc implicitement de 'user' et 'user.emailVerified'
        if (user && user.emailVerified && machines.length > 0 && machines[0]?.id) {
            fetchMachineShots(machines[0].id);
        } else {
            setMachineShots([]); // Vider si pas de conditions remplies
        }
    }, [user, machines]); // Et aussi de machines

    if (authLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Chargement de l'authentification...</div>;
    }

    // Si les données sont en cours de chargement après l'authentification
    // mais seulement si l'utilisateur est connecté et vérifié (car sinon pas de données à charger)
    if (user && user.emailVerified && loading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Chargement des données de l'application...</div>;
    }


    return (
        <div>
            {/* 4. Navbar et Footer seulement si connecté ET vérifié */}
            {user && user.emailVerified && location.pathname !== "/Login" && location.pathname !== "/verify-email" &&
                <Navbar
                    user={user}
                    walletState={{ wallet, fetchWallet }}
                />
            }
            <div className="main-container">
                <Routes>
                    {/* Routes publiques ou semi-publiques */}
                    <Route path="/Login" element={user && user.emailVerified ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/verify-email" element={user && user.emailVerified ? <Navigate to="/" replace /> : <VerifyEmail />} />

                    {/* Routes protégées : accessibles seulement si user && user.emailVerified */}
                    {/* La redirection est gérée globalement par le useEffect de onAuthStateChanged */}
                    <Route path="/" element={user && user.emailVerified ? <Home newsState={{ news, fetchNews }} /> : <Navigate to="/Login" replace />} />
                    <Route path="/menu" element={user && user.emailVerified ? <Menu
                        machineState={{ machines, fetchMachines }}
                        machineShotsState={{ machineShots, fetchMachineShots }}
                        cartState={{ cart, setCart }}
                        walletState={{ wallet, fetchWallet }}
                    /> : <Navigate to="/Login" replace />} />
                    <Route path="/games" element={user && user.emailVerified ? <Games /> : <Navigate to="/Login" replace />} />
                    <Route path="/queue" element={user && user.emailVerified ? <Queue
                        queueState={{ queue, fetchQueue }}
                        machineState={{ machines, fetchMachines }}
                    /> : <Navigate to="/Login" replace />} />
                    <Route path="/admin" element={user && user.emailVerified ? <Admin
                        shotState={{ shots, fetchShots }}
                        machineState={{ machines, fetchMachines }}
                        machineShotsState={{ machineShots, setMachineShots, fetchMachineShots }}
                        walletState={{ wallet, fetchWallet }}
                        commandeState={{ commandes, fetchCommandes }}
                        newsState={{ news, fetchNews }}
                    /> : <Navigate to="/Login" replace />} />
                    <Route path="/leaderboard" element={user && user.emailVerified ? <Leaderboard
                        leaderboardState={{ leaderboard, fetchLeaderboard }}
                    /> : <Navigate to="/Login" replace />} />
                    
                    {/* Fallback pour les routes non trouvées */}
                    <Route path="*" element={<Navigate to={user && user.emailVerified ? "/" : "/Login"} replace />} />
                </Routes>
            </div>
            {user && user.emailVerified && location.pathname !== "/Login" && location.pathname !== "/verify-email" && <Footer />}
        </div>
    );
}

export default App;