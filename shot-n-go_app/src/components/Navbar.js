import { useEffect, useState } from "react";
import { Link, useMatch, useResolvedPath, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getIdTokenResult } from "firebase/auth";
import styles from "../styles/Navbar.module.css";
import user_email from "../assets/user_email.webp";

function Navbar({ user, walletState }) {
  const { wallet, fetchWallet } = walletState;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);
  const toggleNavbar = () => setIsResponsive(prev => !prev);

  useEffect(() => {
    fetchWallet();
  }, []);

  const location = useLocation(); // Pour détecter les changements de route

  // Ferme le menu quand la route change
  useEffect(() => {
    fetchWallet();
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
    <nav className={`${styles.nav} ${isResponsive ? styles.responsive : ""}`} id="myNav">
      <Link to="/" className={styles.site_title}>Shot'N'Go</Link>

      <div className={styles.nav_links}>
        <ul>
          <CustomLink to="/menu">Menu</CustomLink>
          <CustomLink to="/games">Mini-jeux</CustomLink>
          <CustomLink to="/leaderboard">Leaderboard</CustomLink>
          <CustomLink to="/queue">File d'attente</CustomLink>
          {isAdmin && <CustomLink to="/admin">Admin Panel</CustomLink>}

          {(user ? (
              <div className={styles.user_menu}>
                <img
                  src={user.photoURL || user_email}
                  alt="Avatar"
                  className={styles.user_avatar}
                />
                <span className={styles.username}>{user.displayName || "Utilisateur"}</span>
                <span className={styles.wallet}>{wallet && wallet.credit.toFixed(2) || 0}€</span>
                <div className={styles.dropdown_menu}>
                  <button onClick={handleSignOut} className={styles.logout_btn}>
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
      <img loading="lazy" src="/api/images/burger-bar.png" className={styles.icon} onClick={toggleNavbar} alt="burger button" />
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
