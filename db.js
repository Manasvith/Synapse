import mysql from 'mysql2/promise';
import dotenv from 'dotenv'
dotenv.config()

export const connection = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD
});
