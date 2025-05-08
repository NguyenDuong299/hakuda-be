const connection = require("../config/db");

const brandModel = {
  getAllBrand: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT * FROM brands 
        WHERE name LIKE ?
        ORDER BY createdAt DESC
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

  getTotalBrand: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT COUNT(*) AS total 
        FROM brands 
        WHERE name LIKE ?
      `;

      connection.query(sql, [searchQuery], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createBrand: (brand) => {
    const newBrand = {
      ...brand,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO brands SET ?", newBrand, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updateBrand: (id, brand) => {
    const newBrand = {
      ...brand,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE brands SET ? WHERE id = ?", [newBrand, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteBrand: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM brands WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = brandModel;
