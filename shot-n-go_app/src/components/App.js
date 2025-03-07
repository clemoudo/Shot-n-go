import Banner from './Banner'
import logo from '../assets/logo.svg'
// import Cart from './Cart'
import Footer from './Footer'
import ShoppingList from './ShoppingList'

function App() {
	return (
		<div>
			<Banner>
				<img src={logo} alt="Shot'N'Go" className='logo' />
				<h1 className='title'>Shot'N'Go</h1>
			</Banner>

			{/* <Cart /> */}
			<ShoppingList />
			<Footer />
		</div>
	)
}

export default App