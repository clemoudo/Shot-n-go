import logo from '../assets/logo.png'
import '../styles/Banner.css'

function Banner() {
   const title = "Bienvenue sur Shots'N'Go";
   return (
      <div className='sng-banner'>
         <img src={logo} alt="Shot'N'Go" className="sng-logo" />
         <h1 className='sng-title'>{title}</h1>
      </div>
   );
}

export default Banner
