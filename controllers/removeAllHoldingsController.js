import { connection } from '../db.js'

export const removeAllHoldingsController = {
    removeAllHoldings : async(request, response) => {
        try {
            let company = request.body.company
            let [rows] =await connection.query('SELECT * FROM portfolio WHERE company = ?', company)
            
            let allHoldings = rows[0].quantity
            
            const [r] = await connection.query("SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1")
            let curr_balance = r[0].current_balance

            const q = 'INSERT INTO settlementaccount (action, transaction_amount, current_balance, time_stamp) VALUES (?, ?, ?, ?)'
            const v = ['Liquidate', allHoldings*request.body.price, curr_balance + allHoldings*request.body.price, request.body.timestamp]
            await connection.query(q, v)

            const query = 'DELETE FROM portfolio where company = ?'
            await connection.query(query, company)
            
            const que = 'INSERT INTO transactions (company, action, price, quantity, time_stamp) VALUES(?, ?, ?, ?, ?)';
            const vals = [company, 'sell', request.body.price, allHoldings, request.body.timestamp]
            await connection.query(que, vals);

            return response.status(200).json({ success: true, message: "All holdings removed successfully" });
        } catch (error) {
            console.error('Error removing all holdings:', error);
            return response.status(500).json({ success: false, message: error.message });
        }
    }
}