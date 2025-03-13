// import Banner from './Banner'
// import logo from '../assets/logo.svg'
// import Cart from './Cart'
import Footer from './Footer'
import Navbar from './Navbar'
import Home from './Home'
import Menu from './Menu'
import Games from './Games'
import { Route, Routes } from "react-router-dom"

function App() {
	return (
		<div>
			{/* <Banner>
				<img src={logo} alt="Shot'N'Go" className='logo' />
				<h1 className='title'>Shot'N'Go</h1>
			</Banner> */}
			<Navbar />
			<div className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/menu" element={ <Menu /> } />
					<Route path="/games" element={ <Games /> } />
				</Routes>
			</div>
			<Footer />
		</div>
	)
}

export default App