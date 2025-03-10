import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom"

function MyNav() {
   return (
      <Navbar sticky="top" expand="lg" className="bg-body-tertiary">
         <Container>
            <Navbar.Brand>
               <Link to="/">Shot'N'Go</Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
               <Nav className="me-auto">
               <Nav.Link><Link to="/menu">Menu</Link></Nav.Link>
               <Nav.Link><Link to="/mini-jeux">Mini-jeux</Link></Nav.Link>
               </Nav>
            </Navbar.Collapse>
         </Container>
      </Navbar>
    );
}

export default MyNav