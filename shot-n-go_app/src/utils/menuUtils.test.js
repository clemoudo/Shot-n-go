import { deleteItem, addToCart, removeItem } from './menuUtils.mjs';

describe('deleteItem', () => {
  const shotElem = { id: 1, name: 'Espresso' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove the item from the cart when confirmed', () => {
    const mockSetCart = jest.fn();
    window.confirm = jest.fn(() => true);

    deleteItem(shotElem, mockSetCart);

    expect(window.confirm).toHaveBeenCalledWith(
      'Voulez-vous vraiment supprimer "Espresso" du panier ?'
    );
    expect(mockSetCart).toHaveBeenCalled();
  });

  it('should not remove the item if confirmation is canceled', () => {
    const mockSetCart = jest.fn();
    window.confirm = jest.fn(() => false);

    deleteItem(shotElem, mockSetCart);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockSetCart).not.toHaveBeenCalled();
  });
});

describe('addToCart', () => {
  const shotElem = { id: 2, name: 'Latte' };

  it('should add new item to cart if not present', () => {
    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([]);
      expect(result).toEqual([{ ...shotElem, amount: 2 }]);
    });

    addToCart(shotElem, 2, mockSetCart);
    expect(mockSetCart).toHaveBeenCalled();
  });

  it('should update amount if item is already in cart', () => {
    const existingItem = { ...shotElem, amount: 3 };

    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([existingItem]);
      expect(result).toEqual([{ ...shotElem, amount: 5 }]);
    });

    addToCart(shotElem, 2, mockSetCart);
    expect(mockSetCart).toHaveBeenCalled();
  });

  it('should not update cart if addedAmount is 0', () => {
    const mockSetCart = jest.fn();
    addToCart(shotElem, 0, mockSetCart);
    expect(mockSetCart).not.toHaveBeenCalled();
  });
});

describe('removeItem', () => {
  const shotElem = { id: 3, name: 'Cappuccino' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should decrement amount if more than 1', () => {
    const existingItem = { ...shotElem, amount: 3 };

    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([existingItem]);
      expect(result).toEqual([{ ...shotElem, amount: 2 }]);
    });

    removeItem(shotElem, mockSetCart);
    expect(mockSetCart).toHaveBeenCalled();
  });

  it('should remove item if amount is 1 and user confirms', () => {
    const existingItem = { ...shotElem, amount: 1 };
    window.confirm = jest.fn(() => true);

    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([existingItem]);
      expect(result).toEqual([]);
    });

    removeItem(shotElem, mockSetCart);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('should keep item if amount is 1 and user cancels', () => {
    const existingItem = { ...shotElem, amount: 1 };
    window.confirm = jest.fn(() => false);

    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([existingItem]);
      expect(result).toEqual([existingItem]);
    });

    removeItem(shotElem, mockSetCart);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('should not modify cart if item not found', () => {
    const mockSetCart = jest.fn((updateFn) => {
      const result = updateFn([]);
      expect(result).toEqual([]);
    });

    removeItem(shotElem, mockSetCart);
    expect(mockSetCart).toHaveBeenCalled();
  });
});
