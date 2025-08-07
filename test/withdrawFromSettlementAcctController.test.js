import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

const { withdrawFromSettlementAcctController } = await import('../controllers/withdrawFromSettlementAcctController.js');

describe('withdrawFromSettlementAcctController', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ 1: Successful withdrawal
  it('should withdraw successfully if sufficient balance exists', async () => {
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
      .mockResolvedValueOnce([[{ current_balance: 1000 }]]) // Get current balance
      .mockResolvedValueOnce([{}]); // Insert query

    await withdrawFromSettlementAcctController.withdrawFromSettlementAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: "true",
      message: "Amount withdrawn from Settlement Account successfully"
    });
  });

  // ✅ 2: Insufficient balance
  it('should return 400 if balance is insufficient', async () => {
    const req = {
      body: {
        transaction_amount: 1500,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[{ current_balance: 1000 }]]); // Low balance

    await withdrawFromSettlementAcctController.withdrawFromSettlementAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "Insufficient balance in Settlement Account"
    });
  });

  // ✅ 3: No balance row returned
  it('should return 500 if no current balance row found', async () => {
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

    mockQuery.mockResolvedValueOnce([[]]); // No row

    await withdrawFromSettlementAcctController.withdrawFromSettlementAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: expect.any(String)
    });
  });

  // ✅ 4: DB error
  it('should return 500 if database query fails', async () => {
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

    mockQuery.mockRejectedValue(new Error('DB error'));

    await withdrawFromSettlementAcctController.withdrawFromSettlementAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "DB error"
    });
  });
});
