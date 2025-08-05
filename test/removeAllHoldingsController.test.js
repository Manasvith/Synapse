import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

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

  // ❌ Test 2: Company not found in portfolio
  it('should return 404 if company not found in portfolio', async () => {
    const req = {
      body: { company: 'XYZ', price: 200, timestamp: '2025-08-05' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[]]); // no company found

    await removeAllHoldingsController.removeAllHoldings(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No holdings found for the specified company'
    });
  });

  // ❌ Test 3: Quantity is zero
  it('should return 400 if quantity is zero', async () => {
    const req = {
      body: { company: 'XYZ', price: 200, timestamp: '2025-08-05' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[{ quantity: 0 }]]); // quantity is zero

    await removeAllHoldingsController.removeAllHoldings(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cannot sell. Quantity is zero.'
    });
  });

  // ❌ Test 4: Database error while inserting into settlementaccount
  it('should return 500 if error occurs while updating balance', async () => {
    const req = {
      body: {
        company: 'XYZ',
        price: 200,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ quantity: 5 }]]) // portfolio
      .mockResolvedValueOnce([[{ current_balance: 1000 }]]) // balance
      .mockRejectedValueOnce(new Error('DB insert failed')); // settlementaccount insert fails

    await removeAllHoldingsController.removeAllHoldings(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'DB insert failed'
    });
  });

  // ❌ Test 5: Unknown exception thrown
  it('should return 500 if unexpected error occurs', async () => {
    const req = {
      body: {
        company: 'DEF',
        price: 50,
        timestamp: '2025-08-05'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValueOnce(new Error('Unexpected error'));

    await removeAllHoldingsController.removeAllHoldings(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected error'
    });
  });

});
