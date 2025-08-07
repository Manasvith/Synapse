import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

const { addHoldingsController } = await import('../controllers/addHoldingsController.js');

describe('addHoldingsController', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should add new holding when company is not already in portfolio and balance is enough', async () => {
    const req = {
      body: {
        company: 'ABC',
        quantity: 10,
        price: 100,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[]]) // No existing holdings
      .mockResolvedValueOnce([[{ current_balance: 2000 }]]) // Enough balance
      .mockResolvedValueOnce([{}]) // Insert into settlementaccount
      .mockResolvedValueOnce([{}]) // Insert into portfolio
      .mockResolvedValueOnce([{}]); // Insert into transactions

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'New holdings added'
    });
  });

  it('should update holding when company is already in portfolio', async () => {
    const req = {
      body: {
        company: 'XYZ',
        quantity: 5,
        price: 150,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[{ avg_price: 100, quantity: 10 }]]) // Existing holding
      .mockResolvedValueOnce([[{ current_balance: 3000 }]]) // Enough balance
      .mockResolvedValueOnce([{}]) // Insert into settlementaccount
      .mockResolvedValueOnce([{}]) // Update portfolio
      .mockResolvedValueOnce([{}]); // Insert into transactions

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Holdings added successfully'
    });
  });

  it('should return 400 if balance is insufficient', async () => {
    const req = {
      body: {
        company: 'DEF',
        quantity: 10,
        price: 1000,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ current_balance: 200 }]]);

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "Insufficient Balance"
    });
  });

  it('should return 400 if quantity is 0', async () => {
    const req = {
      body: {
        company: 'LMN',
        quantity: 0,
        price: 100,
        timestamp: '2025-08-01 00:00:00'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad request: Quantity must be greater than zero'
    });
  });

  it('should return 500 if company name is missing', async () => {
    const req = {
      body: {
        quantity: 5,
        price: 100,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValueOnce(new Error("Cannot read properties of undefined"));

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: expect.stringContaining("Cannot read")
    });
  });

  it('should return 500 if database throws an error', async () => {
    const req = {
      body: {
        company: 'GHI',
        quantity: 10,
        price: 100,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValueOnce(new Error('DB failure'));

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'DB failure'
    });
  });
});
