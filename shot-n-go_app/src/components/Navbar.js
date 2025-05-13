import { useEffect, useState } from "react";
import { Link, useMatch, useResolvedPath, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getIdTokenResult } from "firebase/auth";
import "../styles/Navbar.css";
import user_email from "../assets/user_email.png";

function Navbar({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);
  const toggleNavbar = () => setIsResponsive(prev => !prev);

  const location = useLocation(); // Pour détecter les changements de route

  // Ferme le menu quand la route change
  useEffect(() => {
    setIsResponsive(false);
  }, [location]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user, true);
          setIsAdmin(tokenResult.claims.role === "admin");
        } catch (err) {
          console.error("Erreur lors de la récupération du rôle :", err);
        }
      }
    };
    checkAdminRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/Login';
    } catch (err) {
      console.error("Erreur de déconnexion", err);
    }
  };

  return (
    <nav className={`nav ${isResponsive ? "responsive" : ""}`} id="myNav">
      <Link to="/" className="site-title">Shot'N'Go</Link>

      <div className="nav-links">
        <ul>
          <CustomLink to="/menu">Menu</CustomLink>
          <CustomLink to="/games">Mini-jeux</CustomLink>
          <CustomLink to="/leaderboard">Leaderboard</CustomLink>
          <CustomLink to="/queue">File d'attente</CustomLink>
          {isAdmin && <CustomLink to="/admin">Admin Panel</CustomLink>}

          {(user ? (
              <div className="user-menu">
                <img
                  src={user.photoURL || user_email}
                  alt="Avatar"
                  className="user-avatar"
                />
                <span className="username">{user.displayName || "Utilisateur"}</span>
                <div className="dropdown-menu">
                  <button onClick={handleSignOut} className="logout-btn">
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <CustomLink to="/login">Authentification</CustomLink>
            )
          )}
        </ul>
      </div>
      <a href="#" className="icon" onClick={toggleNavbar}>
        <i className="fa fa-bars"></i>
      </a>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>{children}</Link>
    </li>
  );
}

export default Navbar;
