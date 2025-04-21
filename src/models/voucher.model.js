const connection = require("../config/db");

const voucherModel = {
  getAllVoucher: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM vouchers", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  createVoucher: (voucher) => {
    const newVoucher = { ...voucher, createdAt: new Date(), updatedAt: new Date() };
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO vouchers SET ?", newVoucher, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  updateVoucher: (id, voucher) => {
    const newVoucher = { ...voucher, updatedAt: new Date() };
    return new Promise((resolve, reject) => {
      connection.query("UPDATE vouchers SET ? WHERE id = ?", [newVoucher, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteVoucher: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM voucher WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = voucherModel;
