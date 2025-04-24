const connection = require("../config/db");

const orderModel = {
  getAllOrder: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
      SELECT
  o.*,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', oi.id,
      'code', p.code,
      'brand', b.name,
      'product_line', pl.name,
      'quantity', oi.quantity,
      'price', oi.price,
      'product_name', p.name
    )
  ) AS order_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_lines pl ON p.product_line_id = pl.id
WHERE o.total_price LIKE ? OR o.recipient_name LIKE ?
GROUP BY o.id
LIMIT ? OFFSET ?
          `;

      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;

      connection.query(sql, [searchQuery, searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        results.forEach((item) => {
          if (!item.order_items || item.order_items.length === 0 || item.order_items.every((item) => item === null)) {
            item.order_items = [];
          }
        });
        resolve(results);
      });
    });
  },

  getTotalOrder: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
            SELECT COUNT(*) AS total 
            FROM orders 
            WHERE total_price LIKE ? OR recipient_name LIKE ?
          `;

      connection.query(sql, [searchQuery, searchQuery], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },

  createOrder: (orderData) => {
    return new Promise((resolve, reject) => {
      const { recipient_name, recipient_phone, recipient_address, total_price, order_items = [] } = orderData;

      if (!order_items.length) {
        return reject(new Error("Order must contain at least one item."));
      }

      const insertOrderSql = `
      INSERT INTO orders (recipient_name, recipient_phone, recipient_address, total_price)
      VALUES (?, ?, ?, ?)
    `;

      connection.beginTransaction((err) => {
        if (err) return reject(err);

        connection.query(insertOrderSql, [recipient_name, recipient_phone, recipient_address, total_price], (err, result) => {
          if (err) return connection.rollback(() => reject(err));

          const orderId = result.insertId;

          const insertItemsSql = `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ?
          `;
          const itemsValues = order_items.map((item) => [orderId, item.product_id, item.quantity, item.price]);
          connection.query(insertItemsSql, [itemsValues], (err) => {
            if (err) return connection.rollback(() => reject(err));
            connection.commit((err) => {
              if (err) return connection.rollback(() => reject(err));
              resolve({ message: "Order created successfully", orderId, order_items });
            });
          });
        });
      });
    });
  },

  updateProduct: (id, product) => {
    const now = new Date();
    const { images = [], ...productData } = product;

    const newProduct = {
      ...productData,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE products SET ? WHERE id = ?", [newProduct, id], (err, result) => {
        if (err) return reject(err);

        connection.query("DELETE FROM product_images WHERE product_id = ?", [id], (err2) => {
          if (err2) return reject(err2);

          if (images.length === 0) return resolve({ id, ...productData, images: [] });

          const imageRows = images.map((url) => [id, url]);
          connection.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageRows], (err3) => {
            if (err3) return reject(err3);
            resolve({ id, ...productData, images });
          });
        });
      });
    });
  },

  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM product_images WHERE product_id = ?", [id], (err) => {
        if (err) return reject(err);

        connection.query("DELETE FROM products WHERE id = ?", [id], (err2, result) => {
          if (err2) return reject(err2);
          resolve(result);
        });
      });
    });
  },
};
module.exports = orderModel;
