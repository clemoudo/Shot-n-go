import { lessOneAddAmout, plusOneAddAmout } from './amountUtils';

describe('lessOneAddAmout', () => {
  it('should decrement addAmount by 1 when addAmount is greater than 0', () => {
    const mockSetAddAmount = jest.fn();
    lessOneAddAmout(5, mockSetAddAmount);
    expect(mockSetAddAmount).toHaveBeenCalledWith(4);
  });

  it('should not call setAddAmount when addAmount is 0', () => {
    const mockSetAddAmount = jest.fn();
    lessOneAddAmout(0, mockSetAddAmount);
    expect(mockSetAddAmount).not.toHaveBeenCalled();
  });

  it('should not call setAddAmount when addAmount is negative', () => {
    const mockSetAddAmount = jest.fn();
    lessOneAddAmout(-3, mockSetAddAmount);
    expect(mockSetAddAmount).not.toHaveBeenCalled();
  });
});

describe('plusOneAddAmout', () => {
  it('should increment addAmount by 1', () => {
    const mockSetAddAmount = jest.fn();
    plusOneAddAmout(2, mockSetAddAmount);
    expect(mockSetAddAmount).toHaveBeenCalledWith(3);
  });
});
