import TasteScale from './TasteScale'
import '../styles/ShotItem.css'

function ShotItem({shotElem, addToCart, removeItem}) {
	return (
		<li className='shot-item' key={shotElem.id} onClick={() => addToCart(shotElem)}>
         <img className='shot-item-cover' src={shotElem.cover} alt={`${shotElem.name} cover`} />
         <p>{shotElem.name}</p>
         <div>
            <TasteScale tasteType='alcoholLevel' scaleValue={shotElem.alcoholLevel} />
            <TasteScale tasteType='sweetness' scaleValue={shotElem.sweetness} />
            <p className='pricecase'>prix:{shotElem.prix}€</p>
         </div>
      </li>
	)
}

export default ShotItem
