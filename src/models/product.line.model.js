const connection = require("../config/db");

const productLineModel = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM product_lines", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  create: (productLine) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO product_lines SET ?", productLine, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  update: (id, productLine) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE product_lines SET ? WHERE id = ?",
        [productLine, id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM product-line WHERE id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },
};

module.exports = productLineModel;
