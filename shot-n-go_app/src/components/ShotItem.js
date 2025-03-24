import TasteScale from './TasteScale'
import '../styles/ShotItem.css'
function handleClick(shotName,price,cart_table,update_table) {
   //alert(`Vous voulez acheter 1 ${shotName} pour ${price} ? Très bon choix`)
   addToCart(shotName,price,cart_table,update_table)
   
}

function addToCart(name,price,cart_table,update_table){
   const currentshotsaved = cart_table.find((shot) => shot.name === name)
		if (currentshotsaved) {
         const cartFilteredCurrentShot = cart_table.filter((shot) => shot.name !== name)
         update_table([
				...cartFilteredCurrentShot,
				{ name, price, amount: currentshotsaved.amount + 1 }
			])

   } else {
      update_table([...cart_table, { name, price, amount: 1 }])
   }
}



function ShotItem({ id, cover, name, alcoholLevel, sweetness,price,cart_table,update_table}) {
   
	return (
		<li className='shot-item' key={id} onClick={() => handleClick(name,price,cart_table,update_table)}>
         
         <img className='shot-item-cover' src={cover} alt={`${name} cover`} />
         {name}
         <div>
            <TasteScale tasteType='alcoholLevel' scaleValue={alcoholLevel} />
            <TasteScale tasteType='sweetness' scaleValue={sweetness} />
            <p className='pricecase'>prix:{price}€</p>
         </div>
      </li>
	)
}

export default ShotItem
