// // ESM-safe Jest mock (before imports)
// import { jest } from '@jest/globals';

// // Mock the db.js module and provide a fake "connection"
// const mockQuery = jest.fn();
// jest.unstable_mockModule('../db.js', () => ({
//   connection: {
//     query: mockQuery
//   }
// }));

// // Now dynamically import the controller AFTER mocking
// const { addHoldingsController } = await import('../controllers/addHoldingsController.js');

// describe('addHoldingsController', () => {
//   it('should add new holdings successfully', async () => {
//     const req = {
//       body: {
//         company: 'ABC',
//         quantity: 10,
//         price: 100,
//         timestamp: '2025-08-01'
//       }
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     // Setup mock return values
//     mockQuery
//       .mockResolvedValueOnce([[]]) // no existing holdings
//       .mockResolvedValueOnce([[{ current_balance: 2000 }]]) // current balance
//       .mockResolvedValueOnce([{}]) // insert into settlementaccount
//       .mockResolvedValueOnce([{}]) // insert into portfolio
//       .mockResolvedValueOnce([{}]); // insert into transactions

//     await addHoldingsController.addHoldings(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: 'New holdings added'
//     });
//   });
// });

import { jest } from '@jest/globals';

const mockQuery = jest.fn();

// ✅ Mock the DB connection
jest.unstable_mockModule('../db.js', () => ({
  connection: {
    query: mockQuery
  }
}));

// ✅ Import the controller AFTER mocking
const { addHoldingsController } = await import('../controllers/addHoldingsController.js');

describe('addHoldingsController', () => {

  beforeEach(() => {
    mockQuery.mockReset(); // Clear mocks between tests
  });

  // ✅ Test 1: Add new holding (company not already held)
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
      .mockResolvedValueOnce([[]]) // company not in portfolio
      .mockResolvedValueOnce([[{ current_balance: 2000 }]]) // current balance
      .mockResolvedValueOnce([{}]) // insert into settlementaccount
      .mockResolvedValueOnce([{}]) // insert into portfolio
      .mockResolvedValueOnce([{}]); // insert into transactions

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "New holdings added" });
  });

  // ✅ Test 2: Add to existing holding (already held)
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
      .mockResolvedValueOnce([[{ avg_price: 100, quantity: 5 }]]) // existing holding
      .mockResolvedValueOnce([[{ current_balance: 2000 }]]) // current balance
      .mockResolvedValueOnce([{}]) // insert into settlementaccount
      .mockResolvedValueOnce([{}]) // update portfolio
      .mockResolvedValueOnce([{}]); // insert into transactions

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Holdings added successfully" });
  });

  // ✅ Test 3: Insufficient balance
  it('should return 400 if balance is insufficient', async () => {
    const req = {
      body: {
        company: 'DEF',
        quantity: 10,
        price: 500,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery
      .mockResolvedValueOnce([[]]) // not in portfolio
      .mockResolvedValueOnce([[{ current_balance: 200 }]]); // insufficient balance

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: "false",
      message: "Insufficient Balance"
    });
  });

  // ✅ Test 4: Internal server error
  it('should return 500 if database query throws an error', async () => {
    const req = {
      body: {
        company: 'GHI',
        quantity: 10,
        price: 50,
        timestamp: '2025-08-01'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockRejectedValue(new Error('DB failure'));

    await addHoldingsController.addHoldings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'DB failure'
    });
  });

});
