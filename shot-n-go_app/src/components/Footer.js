import styles from '../styles/Footer.module.css'

function Footer() {
	return (
      <footer className={styles.footer}>
         <div className={styles.footer_container}>
            <div className={styles.footer_section}>
               <h3 className={styles.footer_title}>Shot'N'Go</h3>
               <p className={styles.footer_text}>
                  L'excellence des spiritueux, servie en un éclair. 
                  Explorez nos sélections uniques pour toutes les occasions.
               </p>
            </div>

            <div className={styles.footer_section}>
               <h4 className={styles.footer_subtitle}>Produits</h4>
               <ul className={styles.footer_links}>
                  <li><a href="#">Nouveautés</a></li>
                  <li><a href="#">Meilleures ventes</a></li>
               </ul>
            </div>

            <div className={styles.footer_section}>
               <h4 className={styles.footer_subtitle}>À propos</h4>
               <ul className={styles.footer_links}>
                  <li><a href="#">Notre histoire</a></li>
                  <li><a href="#">Conditions</a></li>
                  <li><a href="#">Politique de confidentialité</a></li>
               </ul>
            </div>

            <div className={styles.footer_section}>
               <h4 className={styles.footer_subtitle}>Contact</h4>
               <p className={styles.footer_text}>shotngo.project@gmail.com</p>
               {/* <p className={styles.footer_text}>+33 1 23 45 67 89</p>
               <div className={styles.footer_socials}>
                  <a href="#">Facebook</a>
                  <a href="#">Instagram</a>
                  <a href="#">Twitter</a>
               </div> */}
            </div>
         </div>
         <div className={styles.footer_bottom}>
            © {new Date().getFullYear()} Shot'N'Go. Tous droits réservés.
         </div>
      </footer>
   );
};

export default Footer