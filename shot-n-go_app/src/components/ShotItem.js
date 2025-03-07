import TasteScale from './TasteScale'
import '../styles/ShotItem.css'

function handleClick(shotName) {
   alert(`Vous voulez acheter 1 ${shotName} ? Très bon choix 🌱✨`)
}

function ShotItem({ id, cover, name, alcoholLevel, sweetness }) {
	return (
		<li className='shot-item' key={id} onClick={() => handleClick(name)}>
         <img className='shot-item-cover' src={cover} alt={`${name} cover`} />
         {name}
         <div>
            <TasteScale tasteType='alcoholLevel' scaleValue={alcoholLevel} />
            <TasteScale tasteType='sweetness' scaleValue={sweetness} />
         </div>
      </li>
	)
}

export default ShotItem
