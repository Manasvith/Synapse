import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

const { viewTransactionHistoryController } = await import('../controllers/viewTransactionHistoryController.js');

describe('viewTransactionHistoryController', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Test 1: Transaction history found
  it('should return 200 and transaction history if rows exist', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockRows = [
      { id: 1, action: 'buy', company: 'ABC', quantity: 10, price: 100, time_stamp: '2025-08-01' },
      { id: 2, action: 'sell', company: 'XYZ', quantity: 5, price: 150, time_stamp: '2025-08-02' }
    ];
    
    mockQuery.mockResolvedValueOnce([mockRows]);

    await viewTransactionHistoryController.viewTransactionHistory(req, res);

    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM transactions ORDER BY time_stamp DESC');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockRows });
  });

  // ✅ Test 2: No transaction history found
  it('should return 404 if no transaction history found', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[]]);

    await viewTransactionHistoryController.viewTransactionHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No transaction history found'
    });
  });

  // ✅ Test 3: DB error
  it('should return 500 if database query fails', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValue(new Error('DB failure'));

    await viewTransactionHistoryController.viewTransactionHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'DB failure'
    });
  });
});
