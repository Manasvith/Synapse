import { connection } from '../db.js'

export const removeHoldingsController = {
    removeHoldings: async (request, response) => {
        try {
            const [rows] = await connection.query(`
                SELECT * FROM Portfolio WHERE company = ?`,
                [request.body.company]
            )   
            
            let holding = false
            let holding_quantity = 0

            if(rows && rows.length > 0) {
                holding = true
                holding_quantity = rows[0].quantity
            }

            if(holding) {
                if(request.body.quantity > holding_quantity) {
                    return response.status(400).json({ success: false, message: "Quantity exceeds holdings" });
                }
                else if(request.body.quantity === holding_quantity) {
                    const query = 'DELETE FROM portfolio WHERE company = ?'
                    const values = [request.body.company]
                    
                    const [result] = await connection.query(query, values)
                    return response.status(200).json( { 
                        success: true,
                        message: "All Holdings removed successfully" 
                    })
                }
                else {
                    
                    const query = 'UPDATE Portfolio SET quantity = ? WHERE company = ?'
                    const values = [holding_quantity - request.body.quantity, request.body.company]

                    const [rows] = await connection.query(query, values)
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