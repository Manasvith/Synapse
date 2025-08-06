import { connection } from '../db.js'

export const viewSettlementAccountController = {
    viewAccountBalance : async(request, response) => {
        try {
            const query = 'SELECT * FROM settlementaccount ORDER BY time_stamp DESC LIMIT 1'
            const [rows] = await connection.query(query)
            
            if (rows && rows.length > 0) {
                return response.status(200).json({ success: true, data: rows[0].current_balance });
            } else {
                return response.status(404).json({ success: false, message: 'No settlement account data found' });
            }
    
        }catch(error) {
            console.error("Error in performing the operation", error)
            response.status(500).json({ success: "False", message: error.message })
        }
    },

    viewAccountStatement : async(request, response) => {
        try {
            const query = 'SELECT * FROM settlementaccount ORDER BY time_stamp DESC'
            const [rows] = await connection.query(query)
            
            if (rows && rows.length > 0) {
                return response.status(200).json({ success: true, data: rows });
            } else {
                return response.status(404).json({ success: false, message: 'No settlement account statement found' });
            }
    
        } catch (error) {
            console.error("Error in performing the operation", error)
            response.status(500).json({ success: "False", message: error.message })
        }
    }
}