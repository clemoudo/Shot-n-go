import { useEffect } from "react";
import styles from "./Home.module.css";

function Home({ newsState }) {
   const { news, fetchNews } = newsState;

   useEffect(() => {
      fetchNews();
   }, []);

   const featuredNews = [
      {
         title: "Nouveau Shot Fraise-Basilic Disponible !",
         publish_date: new Date().toISOString(),
         content:
            "Nous sommes ravis de vous annoncer le lancement de notre tout nouveau shot : le Fraise-Basilic. Une explosion de fraîcheur et de saveurs à découvrir dès maintenant dans votre machine Shot'N'Go !",
      },
      {
   title: "Nouveau Partenariat avec GreenDrink",
   publish_date: new Date("2025-06-05T10:00:00"),
   content:
      "Shot'N'Go s'associe à GreenDrink pour vous proposer une sélection exclusive de shots écoresponsables. Restez connectés, les premières recettes arrivent très bientôt !",
      },

      {
         title: "Shot Spécial Été : Pastèque-Menthe",
         publish_date: new Date("2025-06-01T09:00:00"),
         content:
            "L'été arrive et avec lui notre shot en édition limitée : Pastèque-Menthe. Disponible uniquement jusqu'à fin août, ne le manquez pas !",
      },
   ];

   return (
      <div className={styles.home_container}>
         <h1>Home</h1>

         <div className={styles.about_us_container}>
            <div className={styles.concept_intro}>
               <h2>Le Concept</h2>
               <p>
                  Bienvenue sur <strong>Shot'N'Go</strong>, le premier service de commande en ligne de shots
                  connecté à une machine distributrice automatisée. Que ce soit pour une soirée entre amis ou un
                  événement, vous pouvez commander vos shots depuis cette interface, et notre machine se charge
                  de les préparer et de les servir instantanément.
               </p>
               <p>
                  Notre système garantit une distribution rapide, hygiénique et fun, pour une expérience
                  inoubliable. Explorez nos actualités ci-dessous et restez à jour sur les nouveautés et
                  améliorations de votre bar connecté !
               </p>
            </div>
         </div>

         <h2>Actualités</h2>
         <div className={styles.news_wrapper}>
            <div className={styles.news_scroll}>
               {[...featuredNews, ...news, ...featuredNews, ...news].map((item, idx) => (
                  <div className={styles.news_card} key={idx}>
                     <h3>{item.title}</h3>
                     <p className={styles.news_date}>{new Date(item.publish_date).toLocaleString()}</p>
                     <p>{item.content}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}

export default Home;
