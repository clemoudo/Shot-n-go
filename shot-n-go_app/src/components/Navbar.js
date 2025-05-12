import '../styles/Navbar.css';
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import user_email from "../assets/user_email.png"

// Liste des UID des administrateurs
// TODO faire une requête api pour avoir les admins
const adminUids = [
  "S0YtLrLSU4ctLskgo81x2w7H1Ru1", // shotngo.project@gmail.com
  "WM2X34sJgLVOhANpr1l1v8TaFqe2"  // clement.vier@gmail.com
];

function Navbar({ user }) {
  // Fonction pour se déconnecter
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirige vers la page de connexion après la déconnexion
      window.location.href = '/Login';
    } catch (err) {
      console.error("Erreur de déconnexion", err);
    }
  };

  return (
    <nav className="nav">
      <ul>
        <Link to="/" className="site-title">
          Shot'N'Go
        </Link>
      
        <CustomLink to="/menu">Menu</CustomLink>
        <CustomLink to="/games">Mini-jeux</CustomLink>
        <CustomLink to="/leaderboard">Leaderboard</CustomLink>
        <CustomLink to="/queue">File d'attente</CustomLink>

        {/* Afficher le lien Admin uniquement si l'utilisateur est l'admin */}
        {adminUids.includes(user?.uid) && (
          <CustomLink to="/admin">Admin Panel</CustomLink>
        )}

        </ul>

      {/* Afficher le bouton de déconnexion si l'utilisateur est connecté */}
      {user && (
        <div className="user-menu">
          <img 
            src={user.photoURL || user_email} 
            alt="Avatar" 
            className="user-avatar"
          />
          <span className="username">{user.displayName || 'Nom d\'utilisateur'}</span>
          <div className="dropdown-menu">
            <button onClick={handleSignOut} className="logout-btn">
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Afficher le lien Login si l'utilisateur n'est pas connecté */}
      {!user && <CustomLink to="/login">Authentification</CustomLink>}
    </nav>
  );
}

// Composant pour les liens qui s'adaptent à l'état actif
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

export default Navbar;
