export const handleChangeMachine = (
   machineId,
   cart,
   setCart,
   setSelectedMachineId,
   fetchMachineShots
) => {
   if (
      cart.length > 0 &&
      !window.confirm(`Voulez-vous vraiment supprimer votre panier actuel ?`)
   ) {
      return;
   }

   setCart([]);
   setSelectedMachineId(machineId);
   fetchMachineShots(machineId);
};