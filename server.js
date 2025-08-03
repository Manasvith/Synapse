import express from "express"
import cors from "cors"
import { addHoldingsController } from './controllers/addHoldingsController.js'
import { removeHoldingsController } from "./controllers/removeHoldingsController.js"
import { viewPortfolioController } from "./controllers/viewPortfolioController.js"

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
app.get('/viewPortfolio', viewPortfolioController.viewPortfolio)

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