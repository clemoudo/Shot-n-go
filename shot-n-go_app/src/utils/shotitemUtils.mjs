export const lessOneAddAmout = (addAmount, setAddAmount) => {
  if (addAmount > 0) {
    setAddAmount(addAmount - 1);
  }
};

export const plusOneAddAmout = (addAmount, setAddAmount) => {
  setAddAmount(addAmount + 1);
};