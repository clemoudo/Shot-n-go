import ShoppingList from './ShoppingList'
import Cart from './Cart'
import { useState } from 'react';

function Menu() {
   const [cart_table, update_table] = useState([])
   return (
      <>
         <Cart cart_table={cart_table} update_table={update_table}/>
         <ShoppingList cart_table={cart_table} update_table={update_table} />
      </>
   );
}

export default Menu