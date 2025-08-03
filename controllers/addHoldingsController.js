import { connection } from '../db.js'

export const addHoldingsController = {
    addHoldings: async (request, response) => {
      try {
        const [rows] = await connection.query(
          'SELECT * FROM portfolio WHERE company = ?',
          [request.body.company]
        );
        
        let alreadyHeld = false
        let holding_price = 0
        let holding_quantity = 0
  
        if (rows && rows.length > 0) {
          alreadyHeld = true
          holding_price = rows[0].avg_price
          holding_quantity = rows[0].quantity
        }
        
        //console.log(request.body.company, alreadyHeld, holding_price, holding_price)

        if (!alreadyHeld) {
          const query = 'INSERT INTO portfolio (company, quantity, avg_price, time_stamp) VALUES (?, ?, ?, ?)'
          const values = [request.body.company, request.body.quantity, request.body.price, request.body.timestamp]
  
          const [result] = await connection.query(query, values)

          const que = 'INSERT INTO transactions (company, action, price, quantity, time_stamp) VALUES(?, ?, ?, ?, ?)'
          const vals = [request.body.company, 'buy', request.body.price, request.body.quantity, request.body.timestamp]
  
          const [res] = await connection.query(que, vals)
          //console.log(res)

          return response.status(200).json({ success: true, message: "New holdings added" })
        } else {
          const newQuantity = holding_quantity + request.body.quantity
          const newAvgPrice =
            ((holding_price * holding_quantity) + (request.body.price * request.body.quantity)) / newQuantity

          const query = 'UPDATE portfolio SET quantity = ?, avg_price = ?, time_stamp = ? WHERE company = ?'
          const values = [newQuantity, newAvgPrice, request.body.timestamp, request.body.company]
  
          const [result] = await connection.query(query, values);

          const que = 'INSERT INTO transactions (company, action, price, quantity, time_stamp) VALUES(?, ?, ?, ?, ?)'
          const vals = [request.body.company, 'buy', request.body.price, request.body.quantity, request.body.timestamp]
  
          const [res] = await connection.query(que, vals)
          //console.log(res)

          return response.status(200).json({ success: true, message: "Holdings added successfully" });
        }

      } catch (error) {
        console.error('Error adding holdings:', error);
        return response.status(500).json({ success: false, message: error.message });
      }
    }
  }