import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

const { viewSettlementAccountController } = await import('../controllers/viewSettlementAccountController.js');

describe('viewSettlementAccountController', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Test 1: viewAccountBalance - valid
  it('should return latest balance if data exists', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockQuery.mockResolvedValueOnce([[{ current_balance: 2500 }]]);

    await viewSettlementAccountController.viewAccountBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: 2500
    });
  });

  // ✅ Test 2: viewAccountBalance - no rows
  it('should return 404 if no balance found', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockQuery.mockResolvedValueOnce([[]]);

    await viewSettlementAccountController.viewAccountBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No settlement account data found'
    });
  });

  // ✅ Test 3: viewAccountBalance - error
  it('should return 500 on DB error in viewAccountBalance', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockQuery.mockRejectedValue(new Error('DB error'));

    await viewSettlementAccountController.viewAccountBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "False",
      message: "DB error"
    });
  });

  // ✅ Test 4: viewAccountStatement - valid
  it('should return statement rows if data exists', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const rows = [
      { current_balance: 2500, time_stamp: '2025-08-01' },
      { current_balance: 2000, time_stamp: '2025-07-30' }
    ];
    mockQuery.mockResolvedValueOnce([rows]);

    await viewSettlementAccountController.viewAccountStatement(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows
    });
  });

  // ✅ Test 5: viewAccountStatement - no rows
  it('should return 404 if no statement data found', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockQuery.mockResolvedValueOnce([[]]);

    await viewSettlementAccountController.viewAccountStatement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No settlement account statement found'
    });
  });

  // ✅ Test 6: viewAccountStatement - error
  it('should return 500 on DB error in viewAccountStatement', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockQuery.mockRejectedValue(new Error('DB failure'));

    await viewSettlementAccountController.viewAccountStatement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: "False",
      message: "DB failure"
    });
  });
});
