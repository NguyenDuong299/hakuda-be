const connection = require("../config/db");

const brandModel = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM brands", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  create: (brand) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO brands SET ?", brand, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  update: (id, brand) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE brands SET ? WHERE id = ?",
        [brand, id],
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
        "DELETE FROM brands WHERE id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },
};

module.exports = brandModel;
