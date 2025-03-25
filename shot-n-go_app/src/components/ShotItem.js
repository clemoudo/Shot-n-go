import TasteScale from './TasteScale'
import '../styles/ShotItem.css'

function handleClick(shotElem, cart_table, update_table) {
   //alert(`Vous voulez acheter 1 ${shotName} pour ${price} ? Très bon choix`)
   addToCart(shotElem, cart_table, update_table)
   
}

function addToCart(shotElem, cart_table, update_table) {
   const currentShotSaved = cart_table.find((shot) => shot.id === shotElem.id);

   if (currentShotSaved) {
       // Si l'article est déjà dans le panier, on met à jour sa quantité
       const updatedCart = cart_table.map((shot) => 
           shot.id === shotElem.id 
               ? { ...shot, amount: shot.amount + 1 } 
               : shot
       );
       update_table(updatedCart);
   } else {
       // Sinon, on l'ajoute avec une quantité de 1
       update_table([...cart_table, { ...shotElem, amount: 1 }]);
   }
}


function ShotItem({shotElem, cart_table, update_table}) {
	return (
		<li className='shot-item' key={shotElem.id} onClick={() => handleClick(shotElem, cart_table, update_table)}>
         <img className='shot-item-cover' src={shotElem.cover} alt={`${shotElem.name} cover`} />
         <p>{shotElem.name}</p>
         <div>
            <TasteScale tasteType='alcoholLevel' scaleValue={shotElem.alcoholLevel} />
            <TasteScale tasteType='sweetness' scaleValue={shotElem.sweetness} />
            <p className='pricecase'>prix:{shotElem.price}€</p>
         </div>
      </li>
	)
}

export default ShotItem
