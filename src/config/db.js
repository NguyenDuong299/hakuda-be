// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '14121611',
  database: 'hakuda_db',
});

connection.connect((err) => {
  if (err) {
    console.error('Kết nối thất bại: ', err);
    return;
  }
  console.log('Kết nối MySQL thành công!');
});

module.exports = connection;
