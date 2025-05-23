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
            {/* Contenu à ajouter ici */}
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