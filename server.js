import express from "express"
import cors from "cors"
import { addHoldingsController } from './controllers/addHoldingsController.js'
import { removeHoldingsController } from "./controllers/removeHoldingsController.js"
import { removeAllHoldingsController } from "./controllers/removeAllHoldingsController.js" 
import { viewPortfolioController } from "./controllers/viewPortfolioController.js"
import { viewTransactionHistoryController } from "./controllers/viewTransactionHistoryController.js"
import { viewSettlementAccountController } from "./controllers/viewSettlementAccountController.js"
import { addToSettlementAcctController } from "./controllers/addToSettlementAcctController.js"
import { withdrawFromSettlementAcctController } from "./controllers/withdrawFromSettlementAcctController.js"

const PORT = 5001
const app = express()

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.post('/addHoldings', addHoldingsController.addHoldings)
app.post('/removeHoldings', removeHoldingsController.removeHoldings)
app.post('/removeAllHoldings', removeAllHoldingsController.removeAllHoldings)
app.get('/viewPortfolio', viewPortfolioController.viewPortfolio)
app.get('/viewTransactionHistory', viewTransactionHistoryController.viewTransactionHistory)
app.get('/viewAcctBalance', viewSettlementAccountController.viewAccountBalance)
app.get('/viewAcctStatement', viewSettlementAccountController.viewAccountStatement)
app.post('/addtoSettlementAcct', addToSettlementAcctController.addToSettlementAccount)
app.post('/withdrawFromSettlementAcct', withdrawFromSettlementAcctController.withdrawFromSettlementAccount)

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!' 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});