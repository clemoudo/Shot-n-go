import ShoppingList from './ShoppingList'
import Cart from './Cart'
import { useState } from 'react';
import {deleteItem,addToCart,removeItem} from '../../utils/menuUtils.mjs'


function Menu({ machineState, machineShotsState, cartState, walletState }) {
   const { cart, setCart } = cartState;
   const [selectedMachineId, setSelectedMachineId] = useState("");

   return (
      <>
         <Cart 
            selectedMachineId={selectedMachineId} 
            walletState={walletState} 
            cartState={cartState} 
            addToCart={addToCart} 
            removeItem={removeItem} 
            deleteItem={deleteItem} 
         />
         <ShoppingList 
            selectedMachineIdState={{ selectedMachineId, setSelectedMachineId }} 
            cartState={cartState} 
            addToCart={addToCart} 
            removeItem={removeItem} 
            machineState={machineState} 
            machineShotsState={machineShotsState} 
         />
      </>
   );
}

export default Menu