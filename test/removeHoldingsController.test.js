import { jest } from '@jest/globals';

const mockQuery = jest.fn();

// ✅ Mock the DB module
jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

// ✅ Import controller AFTER mocking
const { removeHoldingsController } = await import('../controllers/removeHoldingsController.js');

describe('removeHoldingsController', () => {

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Test 1: Partial holdings removal
  it('should partially remove holdings and update portfolio', async () => {
    const req = {
      body: {
        company: 'ABC',
        quantity: 5,
        price: 100,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ quantity: 10 }]]) // existing holdings
      .mockResolvedValueOnce([[{ current_balance: 500 }]]) // current balance
      .mockResolvedValueOnce([{}]) // insert into settlementaccount
      .mockResolvedValueOnce([{}]) // update portfolio
      .mockResolvedValueOnce([{}]); // insert into transactions

    await removeHoldingsController.removeHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Holdings removed successfully'
    });
  });

  // ✅ Test 2: Full liquidation of holdings
  it('should remove all holdings if quantity equals current holding', async () => {
    const req = {
      body: {
        company: 'XYZ',
        quantity: 10,
        price: 50,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ quantity: 10 }]]) // holdings
      .mockResolvedValueOnce([[{ current_balance: 300 }]]) // balance
      .mockResolvedValueOnce([{}]) // insert into settlementaccount
      .mockResolvedValueOnce([{}]) // delete from portfolio
      .mockResolvedValueOnce([{}]); // insert into transactions

    await removeHoldingsController.removeHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'All Holdings removed successfully'
    });
  });

  // ✅ Test 3: Quantity to remove exceeds current holding
  it('should return 400 if quantity exceeds holdings', async () => {
    const req = {
      body: {
        company: 'LMN',
        quantity: 15,
        price: 75,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[{ quantity: 10 }]]); // current holding is less

    await removeHoldingsController.removeHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Quantity exceeds holdings'
    });
  });

  // ✅ Test 4: No holdings found for the company
  it('should return 404 if company not found in portfolio', async () => {
    const req = {
      body: {
        company: 'NOTHELD',
        quantity: 5,
        price: 80,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([]); // no rows returned

    await removeHoldingsController.removeHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No holdings found for the specified company'
    });
  });

});
