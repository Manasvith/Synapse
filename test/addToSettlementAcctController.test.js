import { jest } from '@jest/globals';

const mockQuery = jest.fn();

// ✅ Mock the DB module
jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

// ✅ Import the controller after the mock is applied
const { addToSettlementAcctController } = await import('../controllers/addToSettlementAcctController.js');

describe('addToSettlementAcctController', () => {

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Test 1: Successful balance addition
  it('should add amount to settlement account successfully', async () => {
    const req = {
      body: {
        transaction_amount: 500,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ current_balance: 1000 }]]) // current balance
      .mockResolvedValueOnce([{}]); // insert successful

    await addToSettlementAcctController.addToSettlementAccount(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: "true",
      message: "Amount added to Settlement Account succesfully"
    });
  });

  // ✅ Test 2: No existing balance row
  it('should throw error if balance row is missing', async () => {
    const req = {
      body: {
        transaction_amount: 200,
        timestamp: '2025-08-02'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[]]); // empty result for balance

    await addToSettlementAcctController.addToSettlementAccount(req, res);

    // Should throw when trying to access r[0].current_balance
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: "false"
    });
  });

  // ✅ Test 3: Missing request body field
  it('should return 400 if transaction_amount is undefined', async () => {
    const req = {
      body: {
        timestamp: '2025-08-03'
        // missing transaction_amount
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[{ current_balance: 1000 }]]);

    await addToSettlementAcctController.addToSettlementAccount(req, res);

    // Will fail during calculation (undefined + number)
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: "false"
    }));
  });

  // ✅ Test 4: DB throws exception
  it('should return 500 if a DB error occurs', async () => {
    const req = {
      body: {
        transaction_amount: 300,
        timestamp: '2025-08-04'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValue(new Error('DB insert failed'));

    await addToSettlementAcctController.addToSettlementAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "DB insert failed"
    });
  });

});
