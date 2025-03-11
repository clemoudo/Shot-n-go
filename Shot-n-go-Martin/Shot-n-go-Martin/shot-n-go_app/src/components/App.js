import Banner from './Banner'
import logo from '../assets/logo.svg'
// import Cart from './Cart'
import Footer from './Footer'
import MyNav from './MyNav'
import Home from './Home'
import Menu from './Menu'
import { Route, Routes } from "react-router-dom"
import AlertButton from './button'

function App() {
	return (
		
		<div>
			<AlertButton/>
			<Banner>
				<img src={logo} alt="Shot'N'Go" className='logo' />
				<h1 className='title'>Shot'N'Go</h1>
			</Banner>
			<MyNav /><br />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/menu" element={ <Menu /> } />
				<Route path="/mini-jeux" element={ <Home /> } />
			</Routes>
			<Footer />
			
            
        
       
		</div>
	)
}

export default App