const connection = require("../config/db");

const productLineModel = {
  getAllProductLine: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT * FROM product_lines 
        WHERE name LIKE ?
        LIMIT ? OFFSET ?
      `;

      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;

      connection.query(sql, [searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getTotalProductLine: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT COUNT(*) AS total 
        FROM product_lines 
        WHERE name LIKE ?
      `;

      connection.query(sql, [searchQuery], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createProductLine: (productLine) => {
    const newProductLine = {
      ...productLine,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO product_lines SET ?", newProductLine, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updateProductLine: (id, productLine) => {
    const newProductLine = {
      ...productLine,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE product_lines SET ? WHERE id = ?", [newProductLine, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteProductLine: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM product_lines WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = productLineModel;
