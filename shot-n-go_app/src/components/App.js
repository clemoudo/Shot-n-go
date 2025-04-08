import Footer from './Footer';
import Navbar from './Navbar';
import Home from './Home';
import Menu from './Menu';
import Games from './Games';
import Queue from './Queue';
import TEST_DB from './TEST_DB';
import Login from './Login';
import Register from './Register';  // Importer la page d'inscription
import { Route, Routes, Navigate } from "react-router-dom";  // N'oublie pas d'importer Navigate
import Leaderboard from './Leaderboard';
import { useAuth } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext';  // Assure-toi que AuthProvider est bien importé
import TestTokenPage from '../components/testTokenPage'; // Ajoute l'importation de TestTokenPage

function App() {
  const { currentUser } = useAuth() || {};  // Ajoute un fallback si useAuth() retourne undefined

  return (
    // Envelopper l'application avec le AuthProvider
    <AuthProvider>
      <div>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/games" element={<Games />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/TEST_DB" element={<TEST_DB />} />

            {/* Route pour Login, accessible même si l'utilisateur est connecté */}
            <Route path='/login' element={currentUser ? <Navigate to="/leaderboard" /> : <Login />} />

            {/* Route pour l'inscription */}
            <Route path='/register' element={currentUser ? <Navigate to="/leaderboard" /> : <Register />} />

            {/* Page protégée : Si l'utilisateur est connecté, affiche la page Leaderboard */}
            <Route path="/leaderboard" element={currentUser ? <Leaderboard /> : <Navigate to="/login" />} />

            {/* Route pour la page de test du token */}
            <Route path="/test-token" element={currentUser ? <TestTokenPage /> : <Navigate to="/login" />} />

            {/* Ajoute d'autres pages protégées de la même manière */}
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
