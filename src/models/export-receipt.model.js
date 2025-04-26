const connection = require("../config/db");

const exportReceiptModel = {
  getAllExportReceipt: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;
      const searchQuery = `%${search}%`;

      const sql = `
      SELECT 
        p.id,
        p.order_id,
        p.export_date,
        p.total_amount,
        p.user_id,
        p.status,
        p.createdAt,
        p.updatedAt,
        JSON_ARRAYAGG(
          IF(
            pi.product_id IS NOT NULL AND pi.quantity IS NOT NULL AND pi.export_price IS NOT NULL,
            JSON_OBJECT(
              'product_id', pi.product_id,
              'quantity', pi.quantity,
              'export_price', pi.export_price
            ),
            NULL
          )
        ) AS export_receipt_details
      FROM export_receipts p
      LEFT JOIN export_receipt_details pi ON p.id = pi.export_receipt_id
      WHERE CAST(p.user_id AS CHAR) LIKE ? OR p.status LIKE ?
      GROUP BY p.id
      LIMIT ? OFFSET ?
    `;

      connection.query(sql, [searchQuery, searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);

        results.forEach((item) => {
          try {
            item.export_receipt_details = JSON.parse(item.export_receipt_details);
            if (!Array.isArray(item.export_receipt_details)) item.export_receipt_details = [];
            item.export_receipt_details = item.export_receipt_details.filter((i) => i !== null);
          } catch {
            item.export_receipt_details = [];
          }
        });

        resolve(results);
      });
    });
  },

  createExportReceipt: (exportReceipt) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO export_receipts SET ?`;
      connection.query(sql, exportReceipt, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  updateExportReceipt: (id, exportReceipt) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE export_receipts SET ? WHERE id = ?`;
      connection.query(sql, [exportReceipt, id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  deleteExportReceipt: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM export_receipts WHERE id = ?`;
      connection.query(sql, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
};

module.exports = exportReceiptModel;
