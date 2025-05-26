import { calculateTotalPrice, formatCurrency, calculateAmoutShot } from './cartUtils';

describe('cartUtils', () => {
  describe('calculateTotalPrice', () => {
    it('should return 0 for an empty array', () => {
      expect(calculateTotalPrice([])).toBe(0);
    });

    it('should return 0 for null or undefined input', () => {
      expect(calculateTotalPrice(null)).toBe(0);
      expect(calculateTotalPrice(undefined)).toBe(0);
    });

    it('should calculate the total price correctly', () => {
      const items = [
        { price: '10.00', amount: 2 }, // 20
        { price: '5.50', amount: 1 },  // 5.5
      ];
      expect(calculateTotalPrice(items)).toBe(25.5);
    });

    it('should handle items with invalid price or amount', () => {
      const items = [
        { price: '10.00', amount: 2 },
        { price: 'invalid', amount: 1 },
        { price: '5.00', amount: 'invalid' },
      ];
      expect(calculateTotalPrice(items)).toBe(20); // Seul le premier item est valide
    });
  });

  describe('formatCurrency', () => {
    it('should format amount with default currency (€)', () => {
      expect(formatCurrency(25.5)).toBe('25.50 €');
    });

    it('should format amount with specified currency', () => {
      expect(formatCurrency(100, '$')).toBe('100.00 $');
    });

    it('should format amount with two decimal places', () => {
      expect(formatCurrency(10)).toBe('10.00 €');
      expect(formatCurrency(7.123)).toBe('7.12 €');
    });
  });

  describe('calculateAmoutShot', () => {
    it('should return 0 for an empty array', () => {
      expect(calculateAmoutShot([])).toBe(0);
    });

    it('should return 0 for null or undefined input', () => {
      expect(calculateAmoutShot(null)).toBe(0);
      expect(calculateAmoutShot(undefined)).toBe(0);
    });

    it('should calculate the amout of shot properly', () => {
      const items = [
        { price: '10.00', amount: 2 },
        { price: '5.50', amount: 1 },
      ];
      expect(calculateAmoutShot(items)).toBe(3);
    });

    it('should handle items with invalid price or amount', () => {
      const items = [
        { price: '10.00', amount: 2 },
        { price: 'invalid', amount: 1 },
        { price: '5.00', amount: 'invalid' },
      ];
      expect(calculateAmoutShot(items)).toBe(2); // Seul le premier item est valide
    });
  });
});