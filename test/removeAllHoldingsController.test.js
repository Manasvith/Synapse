import { jest } from '@jest/globals';

const mockQuery = jest.fn();

// ✅ Mock the DB connection
jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

// ✅ Import after mock is active
const { removeAllHoldingsController } = await import('../controllers/removeAllHoldingsController.js');

describe('removeAllHoldingsController', () => {

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Test 1: Successful removal of all holdings
  it('should remove all holdings and update balance successfully', async () => {
    const req = {
      body: {
        company: 'ABC',
        price: 100,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ quantity: 10 }]]) // portfolio lookup
      .mockResolvedValueOnce([[{ current_balance: 1000 }]]) // current balance
      .mockResolvedValueOnce([{}]) // insert into settlementaccount
      .mockResolvedValueOnce([{}]) // delete from portfolio
      .mockResolvedValueOnce([{}]); // insert into transactions

    await removeAllHoldingsController.removeAllHoldings(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'All holdings removed successfully'
    });
  });

});
