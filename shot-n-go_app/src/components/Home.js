import { useEffect, useState } from "react";
import "../styles/Home.css";

function Home({ newsState }) {
   const { news, fetchNews } = newsState;

   useEffect(() => {
      fetchNews();
   }, []);

   return (
      <div className="home-container">
         <h1>Home</h1>

         <div className="about-us-container">
            <div className="concept-intro">
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
         <div className="news-scroll">
            {[...news, ...news].map((item, idx) => (
               <div className="news-card" key={idx}>
                  <h3>{item.title}</h3>
                  <p className="news-date">{new Date(item.publish_date).toLocaleString()}</p>
                  <p>{item.content}</p>
               </div>
            ))}
         </div>
      </div>
   );
}

export default Home;