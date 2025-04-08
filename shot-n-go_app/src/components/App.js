import Footer from './Footer';
import Navbar from './Navbar';
import Home from './Home';
import Menu from './Menu';
import Games from './Games';
import Queue from './Queue';
import TEST_DB from './TEST_DB';
import Login from './Login';
import { Route, Routes, Navigate } from "react-router-dom";
import Leaderboard from './Leaderboard';

// Importer le AuthProvider
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser } = useAuth(); // Utilisation du contexte pour vérifier si l'utilisateur est connecté

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
            <Route path='/TEST_DB' element={<TEST_DB />} />
            
            {/* Page login (toujours accessible) */}
            <Route path='/login' element={<Login />} />
            
            {/* Si l'utilisateur n'est pas connecté, il sera redirigé vers /login */}
            <Route path="/leaderboard" element={currentUser ? <Leaderboard /> : <Navigate to="/login" />} />
            
            {/* Ajoute d'autres pages protégées de la même manière */}
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
