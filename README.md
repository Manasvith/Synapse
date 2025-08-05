# Actual Project

## Description
This project is a portfolio management system that allows users to manage their holdings, view transaction history, and interact with a settlement account. It is built using Node.js, Express, and MySQL.

## Features
- Add, remove, and view holdings in the portfolio.
- View transaction history.
- Manage a settlement account (add funds, withdraw funds, view balance, and account statements).

## Prerequisites
- Node.js (v16 or higher)
- MySQL server
- npm (Node Package Manager)

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd Actual
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure the `.env` file with your database credentials:
   ```plaintext
   HOST: <your-database-host>
   USER: <your-database-user>
   DATABASE: <your-database-name>
   PASSWORD: <your-database-password>
   ```
5. Start the MySQL server and ensure the required tables (`portfolio`, `transactions`, `settlementaccount`) are created in the database.

6. Run the server:
   ```bash
   node server.js
   ```

## API Endpoints
### Portfolio Management
- `POST /addHoldings` - Add holdings to the portfolio.
- `POST /removeHoldings` - Remove specific holdings from the portfolio.
- `POST /removeAllHoldings` - Remove all holdings of a specific company.
- `GET /viewPortfolio` - View all holdings in the portfolio.

### Transaction History
- `GET /viewTransactionHistory` - View the transaction history.

### Settlement Account
- `GET /viewAcctBalance` - View the current balance of the settlement account.
- `GET /viewAcctStatement` - View the settlement account statement.
- `POST /addtoSettlementAcct` - Add funds to the settlement account.
- `POST /withdrawFromSettlementAcct` - Withdraw funds from the settlement account.

## Project Structure
```
Actual/
├── controllers/                # Contains all controller files for handling API logic
├── db.js                       # Database connection setup
├── server.js                   # Main server file
├── .env                        # Environment variables
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

## License
This project is licensed under the ISC License.
