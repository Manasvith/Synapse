import { connection } from '../db.js'

export const viewTransactionHistoryController = {
    viewTransactionHistory: async (request, response) => {
        try {
            const [rows] = await connection.query('SELECT * FROM transactions ORDER BY time_stamp DESC');
            
            if (rows && rows.length > 0) {
                return response.status(200).json({ success: true, data: rows });
            } else {
                return response.status(404).json({ success: false, message: 'No transaction history found' });
            }
        } catch (error) {
            console.error('Error viewing transaction history:', error);
            return response.status(500).json({ success: false, message: error.message });
        }
    }
}