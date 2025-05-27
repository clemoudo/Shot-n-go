import ShoppingList from './ShoppingList'
import Cart from './Cart'
import { useState } from 'react';
import {deleteItem,addToCart,removeItem} from '../../utils/menuUtils.mjs'


function Menu({ machineState, machineShotsState, cartState, walletState }) {
   const { cart, setCart } = cartState;
   const [selectedMachineId, setSelectedMachineId] = useState("");

   // Wrappers pour injecter setCart
   const addToCartWrapper = (shotElem, addedAmount) => addToCart(shotElem, addedAmount, setCart);
   const removeItemWrapper = (shotElem) => removeItem(shotElem, setCart);
   const deleteItemWrapper = (shotElem) => deleteItem(shotElem, setCart);

   return (
      <>
         <Cart 
            selectedMachineId={selectedMachineId} 
            walletState={walletState} 
            cartState={cartState} 
            addToCart={addToCartWrapper} 
            removeItem={removeItemWrapper} 
            deleteItem={deleteItemWrapper} 
         />
         <ShoppingList 
            selectedMachineIdState={{ selectedMachineId, setSelectedMachineId }} 
            cartState={cartState} 
            addToCart={addToCartWrapper} 
            removeItem={removeItemWrapper} 
            machineState={machineState} 
            machineShotsState={machineShotsState} 
         />
      </>
   );
}

export default Menu