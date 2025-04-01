import ShoppingList from './ShoppingList'
import Cart from './Cart'
import { useState } from 'react';



function Menu() {
   const [cart_table, setCartTable] = useState([]);

   // Fonction pour ajouter un article
   const addToCart = (shotElem) => {
      setCartTable((prevCart) => {
         const currentShot = prevCart.find((shot) => shot.id === shotElem.id);

         if (currentShot) {
               return prevCart.map((shot) =>
                  shot.id === shotElem.id ? { ...shot, amount: shot.amount + 1 } : shot
               );
         } else {
               return [...prevCart, { ...shotElem, amount: 1 }];
         }
      });
   };

   // Fonction pour retirer un article
   const removeItem = (shotElem) => {
      setCartTable((prevCart) => {
         const currentShot = prevCart.find((shot) => shot.id === shotElem.id);
         if (!currentShot) return prevCart;

         if (currentShot.amount > 1) {
               return prevCart.map((shot) =>
                  shot.id === shotElem.id ? { ...shot, amount: shot.amount - 1 } : shot
               );
         } else {
               return prevCart.filter((shot) => shot.id !== shotElem.id);
         }
      });
   };
   
   return (
      <>
         <Cart cart_table={cart_table} setCartTable={setCartTable} addToCart={addToCart} removeItem={removeItem} />
         <ShoppingList cart_table={cart_table} addToCart={addToCart} removeItem={removeItem} />
      </>
   );
}

export default Menu