	// import Banner from './Banner'
	// import logo from '../assets/logo.svg'
	import Footer from './Footer'
	import Navbar from './Navbar'
	import Home from './Home'
	import Menu from './Menu'
	import Games from './Games'
	import Queue from './Queue'
	import Admin_pannel from './Admin_pannel'
	import Login from './Login'
	import { Route, Routes } from "react-router-dom"
	import Leaderboard from './Leaderboard';

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
						<Route path="/Queue" element={<Queue />} />
						<Route path='/Admin_pannel' element={<Admin_pannel />}/>
						<Route path='/Login' element={<Login />}/>
						<Route path="/leaderboard" element={<Leaderboard />} />
					</Routes>
				</div>
				<Footer />
			</div>
		)
	}

	export default App