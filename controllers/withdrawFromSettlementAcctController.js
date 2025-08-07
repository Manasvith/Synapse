import { request } from 'express'
import { connection } from '../db.js'

export const withdrawFromSettlementAcctController = {
    withdrawFromSettlementAccount: async(request, response) => {
        try {
            const [r] = await connection.query("SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1")
            let curr_balance = r[0].current_balance

            let new_balance = curr_balance - request.body.transaction_amount

            if (new_balance < 0) {
                return response.status(400).json({success: "false", message: "Insufficient balance in Settlement Account"})
            }

            const query = "INSERT INTO settlementaccount (action, transaction_amount, current_balance, time_stamp) VALUES (?, ?, ?, ?)"
            const values = ["Withdraw", request.body.transaction_amount, new_balance, request.body.timestamp]
            
            await connection.query(query, values)

            return response.status(200).json({success: "true", message: "Amount withdrawn from Settlement Account successfully"})
        } catch(error) {
            console.error("Error in performing the operation", error)
            return response.status(500).json({success: "false", message: error.message})
        }
    }
}