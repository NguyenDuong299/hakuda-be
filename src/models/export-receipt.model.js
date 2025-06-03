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
            JSON_OBJECT(
              'id', pi.id,
              'product_id', pi.product_id,
              'quantity', pi.quantity,
              'export_price', pi.export_price,
              'createdAt', pi.createdAt,
              'updatedAt', pi.updatedAt
            )
        ) AS export_receipt_details
      FROM export_receipts p
      LEFT JOIN export_receipt_details pi ON p.id = pi.export_receipt_id
      WHERE p.id LIKE ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

      connection.query(sql, [searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        results.forEach((item) => {
          if (!item.export_receipt_details || item.export_receipt_details.length === 0 || item.export_receipt_details.every((item) => item === null)) {
            item.export_receipt_details = [];
          }
        });

        resolve(results);
      });
    });
  },

  getTotalExportReceipt: () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT COUNT(*) AS total 
            FROM export_receipts 
          `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createExportReceipt: (orderData) => {
    return new Promise((resolve, reject) => {
      const { order_id, export_date, total_amount, user_id, status, export_receipt_details = [] } = orderData;

      if (!export_receipt_details.length) {
        return reject(new Error("Order must contain at least one item."));
      }

      const insertOrderSql = `
      INSERT INTO export_receipts (order_id, export_date, total_amount, user_id, status)
      VALUES (?, ?, ?, ?, ?)
    `;

      connection.beginTransaction((err) => {
        if (err) return reject(err);

        connection.query(insertOrderSql, [order_id, export_date, total_amount, user_id, status], (err, result) => {
          if (err) return connection.rollback(() => reject(err));

          const exportReceiptId = result.insertId;

          const insertItemsSql = `
            INSERT INTO export_receipt_details (export_receipt_id, product_id, quantity, export_price)
            VALUES ?
          `;
          const itemsValues = export_receipt_details.map((item) => [exportReceiptId, item.product_id, item.quantity, item.export_price]);
          connection.query(insertItemsSql, [itemsValues], (err) => {
            if (err) return connection.rollback(() => reject(err));
            connection.commit((err) => {
              if (err) return connection.rollback(() => reject(err));
              resolve({ message: "Export receipt created successfully", exportReceiptId, export_receipt_details });
            });
          });
        });
      });
    });
  },
  getExportReceiptById: (id) => {
    return new Promise((resolve, reject) => {
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
              JSON_OBJECT(
                'id', pi.id,
                'product_id', pi.product_id,
                'quantity', pi.quantity,
                'export_price', pi.export_price,
                'createdAt', pi.createdAt,
                'updatedAt', pi.updatedAt
              )
          ) AS export_receipt_details
        FROM export_receipts p
        LEFT JOIN export_receipt_details pi ON p.id = pi.export_receipt_id
        WHERE p.id = ?
        GROUP BY p.id
      `;
      connection.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null); // Không tìm thấy

        const item = results[0];

        if (typeof item.export_receipt_details === "string") {
          try {
            item.export_receipt_details = JSON.parse(item.export_receipt_details);
          } catch (e) {
            item.export_receipt_details = [];
          }
        }

        if (!item.export_receipt_details || item.export_receipt_details.every((d) => d === null)) {
          item.export_receipt_details = [];
        }

        resolve(item);
      });
    });
  },

  updateExportReceipt: (id, exportReceipt) => {
    const newExportReceipt = {
      ...exportReceipt,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE export_receipts SET ? WHERE id = ?", [newExportReceipt, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  deleteExportReceipt: (id) => {
    return new Promise((resolve, reject) => {
      const deleteExportReceiptSql = `
        DELETE FROM export_receipts
        WHERE id = ?
      `;

      connection.query(deleteExportReceiptSql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  getTotalRevenue: () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT SUM(total_amount) AS revenue
      FROM export_receipts
      WHERE status = 'completed'
    `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].revenue || 0);
      });
    });
  },
  getRevenueByDay: (date) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT SUM(total_amount) AS revenue
        FROM export_receipts
        WHERE status = 'completed'
        AND DATE(export_date) = ?
      `;
      connection.query(sql, [date], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].revenue || 0);
      });
    });
  },
  getRevenueByMonth: (year) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          MONTH(export_date) AS month,
          SUM(total_amount) AS revenue
        FROM export_receipts
        WHERE status = 'completed'
          AND YEAR(export_date) = ?
        GROUP BY MONTH(export_date)
        ORDER BY month
      `;
      connection.query(sql, [year], (err, results) => {
        if (err) return reject(err);
        const revenueByMonth = Array(12).fill(0);
        results.forEach((row) => {
          revenueByMonth[row.month - 1] = row.revenue || 0;
        });
        resolve(revenueByMonth);
      });
    });
  },
  getRevenueByYear: (year) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT SUM(total_amount) AS revenue
        FROM export_receipts
        WHERE status = 'completed'
        AND YEAR(export_date) = ?
      `;
      connection.query(sql, [year], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].revenue || 0);
      });
    });
  },
  getRevenueByWeek: (year, week) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT SUM(total_amount) AS revenue
        FROM export_receipts
        WHERE status = 'completed'
        AND YEARWEEK(export_date, 1) = ?
      `;
      const yearWeek = parseInt(`${year}${week.toString().padStart(2, "0")}`);
      connection.query(sql, [yearWeek], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].revenue || 0);
      });
    });
  },
};

module.exports = exportReceiptModel;
