const connection = require("../config/db");

const supplierModel = {
  getAllSupplier: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM suppliers", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  getSupplierById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM suppliers WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  createSupplier: (supplier) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO suppliers SET ?", supplier, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  updateSupplier: (id, supplier) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE suppliers SET ? WHERE id = ?", [supplier, id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  deleteSupplier: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM suppliers WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = supplierModel;
