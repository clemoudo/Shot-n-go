import '../styles/Navbar.css'
import { Link, useMatch, useResolvedPath } from "react-router-dom"

function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        Shot'N'Go
      </Link>
      <ul>
        <CustomLink to="/menu">Menu</CustomLink>
        <CustomLink to="/games">Mini-jeux</CustomLink>
        <CustomLink to="/queue">File d'attente</CustomLink>
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