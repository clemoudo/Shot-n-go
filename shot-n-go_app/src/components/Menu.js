import ShoppingList from './ShoppingList'
import Cart from './Cart'
import { useState } from 'react';



function Menu({shots, fetchShots}) {
   const [cart_table, setCartTable] = useState([]);

   // Fonction pour ajouter un article
   const addToCart = (shotElem,addedAmount) => {
      if (addedAmount > 0){
         setCartTable((prevCart) => {
            const currentShot = prevCart.find((shot) => shot.id === shotElem.id);
            if (currentShot) {
                  return prevCart.map((shot) =>
                     shot.id === shotElem.id ? { ...shot, amount: shot.amount + addedAmount } : shot
                  );
            } else {
                  return [...prevCart, { ...shotElem, amount: addedAmount }];
            }
         });
      }
   };

   // Fonction pour retirer un article
   const removeItem = (shotElem) => {
      setCartTable((prevCart) => {
         const currentShot = prevCart.find((shot) => shot.id === shotElem.id);
         if (!currentShot) return prevCart;
   
         // Si la quantité est de 1, demander confirmation avant suppression
         if (currentShot.amount === 1) {
            const confirmDelete = window.confirm(
               `Voulez-vous vraiment retirer "${currentShot.name}" du panier ?`
            );
            if (confirmDelete) {
               return prevCart.filter((shot) => shot.id !== shotElem.id);
            } else {
               return prevCart; // Ne rien faire si l'utilisateur annule
            }
         }
   
         // Si la quantité est supérieure à 1, simplement décrémenter
         return prevCart.map((shot) =>
            shot.id === shotElem.id ? { ...shot, amount: shot.amount - 1 } : shot
         );
      });
   };

   const deleteItem = (shotElem) => {
      const confirmDelete = window.confirm(
         `Voulez-vous vraiment supprimer "${shotElem.name}" du panier ?`
      );
   
      if (!confirmDelete) return;
   
      setCartTable((prevCart) =>
         prevCart.filter((shot) => shot.id !== shotElem.id)
      );
   };   

   const clearCart = () => {
      const confirmClear = window.confirm(
         "Êtes-vous sûr de vouloir supprimer tous les articles du panier ?"
      );
   
      if (!confirmClear) return;
   
      setCartTable([]);
   };   
   
   
   return (
      <>
         <Cart cart_table={cart_table} setCartTable={setCartTable} addToCart={addToCart} removeItem={removeItem} deleteItem={deleteItem} clearCart={clearCart} />
         <ShoppingList cart_table={cart_table} addToCart={addToCart} removeItem={removeItem} shots={shots} fetchShots={fetchShots} />
      </>
   );
}

export default Menu