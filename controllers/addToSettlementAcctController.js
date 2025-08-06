import { connection } from '../db.js'

export const addToSettlementAcctController = {
    addToSettlementAccount: async (request, response) => {
        try {

            if(typeof(request.body.transaction_amount) !== 'number') {
                return response.status(400).json({success: "false", message: "Bad request: No amount specified"})
            }

            const [r] = await connection.query("SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1")
            let curr_balance = 0

            if(r.length !== 0) {
                curr_balance = r[0].current_balance
            }

            let new_balance = curr_balance + request.body.transaction_amount

            const query = "INSERT INTO settlementaccount (action, transaction_amount, current_balance, time_stamp) VALUES (?, ?, ?, ?)"
            const values = ["Add", request.body.transaction_amount, new_balance, request.body.timestamp]
            
            await connection.query(query, values)

            return response.status(200).json({success: "true", message: "Amount added to Settlement Account succesfully"})
        } catch(error)
        {
            console.error("Error in performing the operation", error)
            return response.status(500).json({success: "false", message: error.message})
        }    
    }
}