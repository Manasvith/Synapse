import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

const { viewPortfolioController } = await import('../controllers/viewPortfolioController.js');

describe('viewPortfolioController', () => {

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ✅ Case 1: Portfolio has holdings
  it('should return portfolio data with status 200', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const fakeData = [
      { company: 'ABC', quantity: 10, avg_price: 100 },
      { company: 'XYZ', quantity: 5, avg_price: 200 }
    ];

    mockQuery.mockResolvedValueOnce([fakeData]);

    await viewPortfolioController.viewPortfolio(req, res);

    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM portfolio');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeData
    });
  });

  // ✅ Case 2: Empty portfolio
  it('should return 404 if portfolio is empty', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValueOnce([[]]);

    await viewPortfolioController.viewPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No holdings in the portfolio'
    });
  });

  // ✅ Case 3: DB Error
  it('should return 500 if database query fails', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValue(new Error('DB failure'));

    await viewPortfolioController.viewPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'DB failure'
    });
  });

});
