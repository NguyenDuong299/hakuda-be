const connection = require("../config/db");

const importReceiptModel = {
  getAllImportReceipt: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;
      const searchQuery = `%${search}%`;

      const sql = `
      SELECT 
        p.id,
        p.supplier_id,
        p.import_date,
        p.total_amount,
        p.note,
        p.createdAt,
        p.updatedAt,
        JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pi.id,
              'product_id', pi.product_id,
              'quantity', pi.quantity,
              'import_price', pi.import_price,
              'createdAt', pi.createdAt,
              'updatedAt', pi.updatedAt
            )
        ) AS import_receipt_details
      FROM import_receipts p
      LEFT JOIN import_receipt_details pi ON p.id = pi.import_receipt_id
      WHERE CAST(p.supplier_id AS CHAR) LIKE ? OR CAST(p.id AS CHAR) LIKE ?
      GROUP BY p.id
      LIMIT ? OFFSET ?
    `;

      connection.query(sql, [searchQuery, searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        results.forEach((item) => {
          if (!item.import_receipt_details || item.import_receipt_details.length === 0 || item.import_receipt_details.every((item) => item === null)) {
            item.import_receipt_details = [];
          }
        });

        resolve(results);
      });
    });
  },

  getTotalImportReceipt: () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT COUNT(*) AS total 
            FROM import_receipts 
          `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createImportReceipt: (supplierData) => {
    return new Promise((resolve, reject) => {
      const { supplier_id, import_date, total_amount, note, import_receipt_details = [] } = supplierData;

      if (!import_receipt_details.length) {
        return reject(new Error("Nhà cung cấp trống"));
      }

      const insertOrderSql = `
      INSERT INTO import_receipts (supplier_id, import_date, total_amount, note)
      VALUES (?, ?, ?, ?)
    `;

      connection.beginTransaction((err) => {
        if (err) return reject(err);

        connection.query(insertOrderSql, [supplier_id, import_date, total_amount, note], (err, result) => {
          if (err) return connection.rollback(() => reject(err));

          const importReceiptId = result.insertId;

          const insertItemsSql = `
            INSERT INTO import_receipt_details (import_receipt_id, product_id, quantity, import_price)
            VALUES ?
          `;
          const itemsValues = import_receipt_details.map((item) => [importReceiptId, item.product_id, item.quantity, item.import_price]);
          connection.query(insertItemsSql, [itemsValues], (err) => {
            if (err) return connection.rollback(() => reject(err));
            connection.commit((err) => {
              if (err) return connection.rollback(() => reject(err));
              resolve({ message: "Tạo hoá đơn nhập thành công", importReceiptId, import_receipt_details });
            });
          });
        });
      });
    });
    },
  
  deleteImportReceipt: (id) => {
    return new Promise((resolve, reject) => {
      const deleteImportReceipt = `
        DELETE FROM import_receipts
        WHERE id = ?
      `;

      connection.query(deleteImportReceipt, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = importReceiptModel;
