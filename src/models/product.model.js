const connection = require("../config/db");

const productModel = {
  getAllProduct: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
                SELECT * FROM products
                WHERE name LIKE ? OR code LIKE ? 
                LIMIT ? OFFSET ?
            `;
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;
      connection.query(sql, [searchQuery, searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};
module.exports = productModel;
