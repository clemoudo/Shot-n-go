import ShoppingList from './ShoppingList'
import Cart from './Cart'

function Menu({ shotState, cartState }) {
   const { shots, fetchShots } = shotState;
   const { cart, setCart } = cartState;

   // Fonction pour ajouter un article
   const addToCart = (shotElem, addedAmount) => {
      if (addedAmount > 0){
         setCart((prevCart) => {
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
      setCart((prevCart) => {
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
   
      setCart((prevCart) =>
         prevCart.filter((shot) => shot.id !== shotElem.id)
      );
   };   

   const clearCart = () => {
      const confirmClear = window.confirm(
         "Êtes-vous sûr de vouloir supprimer tous les articles du panier ?"
      );
   
      if (!confirmClear) return;
   
      setCart([]);
   };   
   
   
   return (
      <>
         <Cart cart={cart} addToCart={addToCart} removeItem={removeItem} deleteItem={deleteItem} clearCart={clearCart} />
         <ShoppingList addToCart={addToCart} removeItem={removeItem} shotState={{ shots, fetchShots }} />
      </>
   );
}

export default Menu