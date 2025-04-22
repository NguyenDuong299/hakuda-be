const connection = require("../config/db");

const voucherModel = {
  getAllVoucher: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT * FROM vouchers 
        WHERE code LIKE ? OR discountType LIKE ? 
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

  getTotalVoucher: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
        SELECT COUNT(*) AS total 
        FROM vouchers 
        WHERE code LIKE ? OR discountType LIKE ?
      `;

      connection.query(sql, [searchQuery, searchQuery], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createVoucher: (voucher) => {
    const newVoucher = {
      ...voucher,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO vouchers SET ?", newVoucher, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  updateVoucher: (id, voucher) => {
    const newVoucher = {
      ...voucher,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE vouchers SET ? WHERE id = ?", [newVoucher, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteVoucher: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM vouchers WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = voucherModel;
