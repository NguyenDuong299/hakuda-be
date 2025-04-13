// db.js
require('dotenv').config(); // Load environment variables from .env file

const mysql = require('mysql2');

// Make sure the environment variables are set
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'my_database';

const connection = mysql.createConnection({
  host,
  user,
  password,
  database,
});

connection.connect((err) => {
  if (err) {
    console.error('Kết nối thất bại: ', err);
    return;
  }
  console.log('Kết nối MySQL thành công!');
});

module.exports = connection;
