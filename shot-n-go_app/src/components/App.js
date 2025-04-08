import Footer from './Footer';
import Navbar from './Navbar';
import Home from './Home';
import Menu from './Menu';
import Games from './Games';
import Queue from './Queue';
import TEST_DB from './TEST_DB';
import Login from './Login';
import { Route, Routes } from "react-router-dom";
import Leaderboard from './Leaderboard';

// Importer le AuthProvider
import { AuthProvider } from './contexts/AuthContext';
// Importer PrivateRoute
import PrivateRoute from './components/PrivateRoute'; // Assurez-vous que PrivateRoute.js est dans ce dossier

function App() {
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
            <Route path='/login' element={<Login />} />
            
            {/* Route protégée : Si l'utilisateur est connecté, la route est accessible */}
            <PrivateRoute path="/leaderboard" element={<Leaderboard />} />

            {/* Si tu as d'autres pages protégées, tu peux les ajouter ici, de la même manière */}
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
