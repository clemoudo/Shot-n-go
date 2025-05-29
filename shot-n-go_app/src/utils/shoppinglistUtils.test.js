import { handleChangeMachine } from './shoppinglistUtils.mjs';

describe('handleChangeMachine', () => {
  const mockSetCart = jest.fn();
  const mockSetSelectedMachineId = jest.fn();
  const mockFetchMachineShots = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should switch machine and clear cart when cart is empty (no confirmation needed)', () => {
    const machineId = 42;
    const cart = [];

    handleChangeMachine(
      machineId,
      cart,
      mockSetCart,
      mockSetSelectedMachineId,
      mockFetchMachineShots
    );

    expect(mockSetCart).toHaveBeenCalledWith([]);
    expect(mockSetSelectedMachineId).toHaveBeenCalledWith(machineId);
    expect(mockFetchMachineShots).toHaveBeenCalledWith(machineId);
  });

  it('should ask for confirmation if cart is not empty', () => {
    const machineId = 13;
    const cart = [{ id: 1, name: 'Macchiato' }];
    window.confirm = jest.fn(() => true); // user confirms

    handleChangeMachine(
      machineId,
      cart,
      mockSetCart,
      mockSetSelectedMachineId,
      mockFetchMachineShots
    );

    expect(window.confirm).toHaveBeenCalledWith(
      'Voulez-vous vraiment supprimer votre panier actuel ?'
    );
    expect(mockSetCart).toHaveBeenCalledWith([]);
    expect(mockSetSelectedMachineId).toHaveBeenCalledWith(machineId);
    expect(mockFetchMachineShots).toHaveBeenCalledWith(machineId);
  });

  it('should cancel machine change if user does not confirm', () => {
    const machineId = 99;
    const cart = [{ id: 2, name: 'Flat White' }];
    window.confirm = jest.fn(() => false); // user cancels

    handleChangeMachine(
      machineId,
      cart,
      mockSetCart,
      mockSetSelectedMachineId,
      mockFetchMachineShots
    );

    expect(window.confirm).toHaveBeenCalled();
    expect(mockSetCart).not.toHaveBeenCalled();
    expect(mockSetSelectedMachineId).not.toHaveBeenCalled();
    expect(mockFetchMachineShots).not.toHaveBeenCalled();
  });
});
