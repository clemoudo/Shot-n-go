import '../styles/Navbar.css'
import { Link, useMatch, useResolvedPath } from "react-router-dom"

function Navbar({ user }) {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        Shot'N'Go
      </Link>
      <ul>
        <CustomLink to="/menu">Menu</CustomLink>
        <CustomLink to="/games">Mini-jeux</CustomLink>
        <CustomLink to="/leaderboard">Leaderboard</CustomLink>
        <CustomLink to="/queue">File d'attente</CustomLink>
        {user === "S0YtLrLSU4ctLskgo81x2w7H1Ru1" && <CustomLink to="/Admin_pannel">Admin_pannel</CustomLink>}
        <CustomLink to="/Login">Authentification</CustomLink>
      </ul>
    </nav>
  )
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )
}

export default Navbar