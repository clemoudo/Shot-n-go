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
	import { useState, useEffect } from "react";
	import { Route, Routes } from "react-router-dom"
	import Leaderboard from './Leaderboard';

	function App() {
		const [shots, setShots] = useState([]);
		const [loading, setLoading] = useState(true);


		const fetchShots = async () => {
			try {
			  const response = await fetch("/api/shot/receive/");
			  if (!response.ok) {
				const text = await response.text(); // pour voir le message d’erreur du serveur
				console.error("Erreur HTTP:", response.status, response.statusText, text);
				return;
			  }
		  
			  const data = await response.json();
			  console.log("Shots récupérés :", data.shots); // Debug info
			  setShots(data.shots);
			  setLoading(false);
			} catch (error) {
			  console.error("Erreur de connexion:", error);
			}
		  };
		  
		
		  useEffect(() => {
			console.log("useEffect mounted");
			const intervalId = setInterval(() => {
			  console.log("Interval tick");
			  fetchShots();
			}, 60000);
			return () => {
			  console.log("useEffect unmounted");
			  clearInterval(intervalId);
			};
		  }, []);

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
						<Route path="/menu" element={ <Menu shots={shots} setShots={setShots}/> } />
						<Route path="/games" element={ <Games /> } />
						<Route path="/Queue" element={<Queue />} />
						<Route path='/Admin_pannel' element={<Admin_pannel shots={shots} setShots={setShots} loading={loading} setLoading={setLoading} fetchShots={fetchShots} />}/>
						<Route path='/Login' element={<Login />}/>
						<Route path="/leaderboard" element={<Leaderboard />} />
					</Routes>
				</div>
				<Footer />
			</div>
		)
	}

	export default App