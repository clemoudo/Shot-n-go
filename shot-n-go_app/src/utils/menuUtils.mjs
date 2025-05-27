// Fonction pour supprimer un article du panier
export const deleteItem = (shotElem, setCart) => {
   const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer "${shotElem.name}" du panier ?`
   );

   if (!confirmDelete) return;

   setCart((prevCart) =>
      prevCart.filter((shot) => shot.id !== shotElem.id)
   );
};

// Fonction pour ajouter un article au panier
export const addToCart = (shotElem, addedAmount, setCart) => {
   if (addedAmount > 0) {
      setCart((prevCart) => {
         const currentShot = prevCart.find((shot) => shot.id === shotElem.id);
         if (currentShot) {
            return prevCart.map((shot) =>
               shot.id === shotElem.id
                  ? { ...shot, amount: shot.amount + addedAmount }
                  : shot
            );
         } else {
            return [...prevCart, { ...shotElem, amount: addedAmount }];
         }
      });
   }
};

// Fonction pour retirer un article du panier
export const removeItem = (shotElem, setCart) => {
   setCart((prevCart) => {
      const currentShot = prevCart.find((shot) => shot.id === shotElem.id);
      if (!currentShot) return prevCart;

      if (currentShot.amount === 1) {
         const confirmDelete = window.confirm(
            `Voulez-vous vraiment retirer "${currentShot.name}" du panier ?`
         );
         if (confirmDelete) {
            return prevCart.filter((shot) => shot.id !== shotElem.id);
         } else {
            return prevCart;
         }
      }

      return prevCart.map((shot) =>
         shot.id === shotElem.id
            ? { ...shot, amount: shot.amount - 1 }
            : shot
      );
   });
};
