import '../styles/Footer.css'

function Footer() {
	return (
      <footer className="footer">
         <div className="footer-container">
            <div className="footer-section">
               <h3 className="footer-title">Shot'N'Go</h3>
               <p className="footer-text">
                  L'excellence des spiritueux, servie en un éclair. 
                  Explorez nos sélections uniques pour toutes les occasions.
               </p>
            </div>

            <div className="footer-section">
               <h4 className="footer-subtitle">Produits</h4>
               <ul className="footer-links">
                  <li><a href="#">Nouveautés</a></li>
                  <li><a href="#">Meilleures ventes</a></li>
               </ul>
            </div>

            <div className="footer-section">
               <h4 className="footer-subtitle">À propos</h4>
               <ul className="footer-links">
                  <li><a href="#">Notre histoire</a></li>
                  <li><a href="#">Conditions</a></li>
                  <li><a href="#">Politique de confidentialité</a></li>
               </ul>
            </div>

            <div className="footer-section">
               <h4 className="footer-subtitle">Contact</h4>
               <p className="footer-text">shotngo.project@gmail.com</p>
               {/* <p className="footer-text">+33 1 23 45 67 89</p>
               <div className="footer-socials">
                  <a href="#">Facebook</a>
                  <a href="#">Instagram</a>
                  <a href="#">Twitter</a>
               </div> */}
            </div>
         </div>
         <div className="footer-bottom">
            © {new Date().getFullYear()} Shot'N'Go. Tous droits réservés.
         </div>
      </footer>
   );
};

export default Footer