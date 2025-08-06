import { connection } from '../db.js'

export const removeHoldingsController = {
    removeHoldings: async (request, response) => {
        try {
            const [rows] = await connection.query(`
                SELECT * FROM Portfolio WHERE company = ?`,
                [request.body.company]
            )   

            if(request.body.quantity <= 0) {
                return response.status(400).json({ success: false, message: "Bad request: Quantity must be greater than zero" });
            }
            
            let holding = false
            let holding_quantity = 0
            let price = 0

            if(rows && rows.length > 0) {
                holding = true
                holding_quantity = rows[0].quantity
            } else {
                return response.status(404).json({ 
                    success: false, 
                    message: 'No holdings found for the specified company' 
                });
            }

            if(holding) {
                if(request.body.quantity > holding_quantity) {
                    return response.status(400).json({ success: false, message: "Quantity exceeds holdings" });
                }
                else if(request.body.quantity === holding_quantity) {
                    const [r] = await connection.query("SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1")
                    let curr_balance = r[0].current_balance

                    const q = "INSERT INTO settlementaccount (action, transaction_amount, current_balance, time_stamp) VALUES (?, ?, ?, ?);"
                    const v = ['Liquidate', holding_quantity*request.body.price, curr_balance + holding_quantity*request.body.price, request.body.timestamp]
                    await connection.query(q, v)
                    console.log(connection.format(q, v));

                    const query = 'DELETE FROM portfolio WHERE company = ?'
                    const values = [request.body.company]
                    
                    const [result] = await connection.query(query, values)
                    
                    const que = 'INSERT INTO transactions (company, action, price, quantity, time_stamp) VALUES(?, ?, ?, ?, ?)'
                    const vals = [request.body.company, 'sell', request.body.price, request.body.quantity, request.body.timestamp]
                    
                    const [res] = await connection.query(que, vals)

                    return response.status(200).json( { 
                        success: true,
                        message: "All Holdings removed successfully" 
                    })
                }
                else {
                    
                    const [r] = await connection.query("SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1")
                    let curr_balance = r[0].current_balance

                    const q = 'INSERT INTO settlementaccount (action, transaction_amount, current_balance, time_stamp) VALUES (?, ?, ?, ?)'
                    const v = ['Liquidate', request.body.quantity*request.body.price, curr_balance + holding_quantity*request.body.price, request.body.timestamp]
                    await connection.query(q, v)

                    const query = 'UPDATE Portfolio SET quantity = ? WHERE company = ?'
                    const values = [holding_quantity - request.body.quantity, request.body.company]

                    const [rows] = await connection.query(query, values)

                    const que = 'INSERT INTO transactions (company, action, price, quantity, time_stamp) VALUES(?, ?, ?, ?, ?)'
                    const vals = [request.body.company, 'sell', request.body.price, request.body.quantity, request.body.timestamp]

                    const [res] = await connection.query(que, vals)

                    return response.status(200).json( {
                        success: true,
                        message: 'Holdings removed successfully'
                    })
                }
            }
            else {
                return response.status(404).json({ 
                    success: false, 
                    message: 'No holdings found for the specified company' 
                });
            }
            
        } catch (error) {
            console.error('Error adding holdings:', error);
            return response.status(500).json({ success: false, message: error.message });
        }
    }   
}