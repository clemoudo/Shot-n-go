export const calculateTotalPrice = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => {
    // S'assurer que price et amount sont des nombres valides
    const price = parseFloat(item.price);
    const amount = parseInt(item.amount, 10);
    if (isNaN(price) || isNaN(amount)) {
      return sum; // Ignorer les items invalides ou retourner une erreur
    }
    return sum + price * amount;
  }, 0);
};

export const formatCurrency = (amount, currency = '€') => {
  return `${amount.toFixed(2)} ${currency}`;
};

export const calculateAmoutShot = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => {
    // S'assurer que price et amount sont des nombres valides
    const price = parseFloat(item.price);
    const amount = parseInt(item.amount, 10);
    if (isNaN(price) || isNaN(amount)) {
      return sum; // Ignorer les items invalides ou retourner une erreur
    }
    return sum + amount;
  }, 0);
};