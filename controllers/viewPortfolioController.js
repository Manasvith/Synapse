import { connection } from '../db.js'

export const viewPortfolioController = {
    viewPortfolio : async(request, response) => {
        try {
            const [rows] = await connection.query('SELECT * FROM portfolio');
            
            if (rows && rows.length > 0) {
                return response.status(200).json({ success: true, data: rows });
            } else {
                return response.status(404).json({ success: false, message: 'No holdings in the portfolio' });
            }
        } catch (error) {
            console.error('Error viewing portfolio:', error);
            return response.status(500).json({ success: false, message: error.message });
        }
    },

    viewPortfolioCompanies : async(request, response) => {
        try {
            const [rows] = await connection.query('SELECT company FROM portfolio');
            
            if (rows && rows.length > 0) {
                return response.status(200).json({ success: true, data: rows });
            } else {
                return response.status(404).json({ success: false, message: 'No holdings in the portfolio' });
            }
        } catch (error) {
            console.error('Error viewing portfolio for company:', error);
            return response.status(500).json({ success: false, message: error.message });
        }
    } 
} 