const connection = require("../config/db");

const productModel = {
  getAllOrder: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
       SELECT
  o.*,
  JSON_ARRAYAGG(
    CASE
      WHEN oi.product_id IS NOT NULL AND oi.quantity IS NOT NULL AND oi.price IS NOT NULL
      THEN JSON_OBJECT(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', p.name,
        'product_image', p.image,
        'product_description', p.description
      )
      ELSE NULL
    END
  ) AS order_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.total_price LIKE ? OR o.recipient_name LIKE ?
GROUP BY o.id
LIMIT ? OFFSET ?

     `;
      //   SELECT
      //     o.*,
      //     JSON_ARRAYAGG(
      //       IF(
      //         oi.product_id IS NOT NULL,
      //         JSON_OBJECT(
      //           'product_id', oi.product_id,
      //           'quantity', oi.quantity,
      //           'price', oi.price
      //         ),
      //         NULL
      //       )
      //     ) AS order_items
      //   FROM orders o
      //   LEFT JOIN order_items oi ON o.id = oi.order_id
      //   WHERE o.total_price LIKE ? OR o.recipient_name LIKE ?
      //   GROUP BY o.id
      //   LIMIT ? OFFSET ?
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;

      connection.query(sql, [searchQuery, searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);

        results.forEach((item) => {
          try {
            item.order_items = JSON.parse(item.order_items);
            if (!Array.isArray(item.order_items)) item.order_items = [];
            item.order_items = item.order_items.filter((i) => i !== null);
          } catch {
            item.order_items = [];
          }
        });

        resolve(results);
      });
    });
  },

  getTotalProduct: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
            SELECT COUNT(*) AS total 
            FROM products 
            WHERE name LIKE ? OR code LIKE ?
          `;

      connection.query(sql, [searchQuery, searchQuery], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },
  createProduct: (product) => {
    const now = new Date();
    const { images = [], ...productData } = product;

    const newProduct = {
      ...productData,
      code: "TMP",
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO products SET ?", newProduct, (err, result) => {
        if (err) return reject(err);

        const newId = result.insertId;
        const newCode = `MSP${newId}`;

        connection.query("UPDATE products SET code = ? WHERE id = ?", [newCode, newId], (err2) => {
          if (err2) return reject(err2);

          if (!images.length) {
            return resolve({ id: newId, ...productData, code: newCode, images: [] });
          }

          const safeImages = Array.isArray(images) ? images : [];
          const imageRows = safeImages.map((img) => [newId, img.image_url, img.isThumbnail || false]);

          connection.query("INSERT INTO product_images (product_id, image_url, isThumbnail) VALUES ?", [imageRows], (err3) => {
            if (err3) return reject(err3);
            resolve({ id: newId, ...productData, code: newCode, images });
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
  deleteProductImages: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM product_images WHERE product_id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
  addProductImages: (imageRows) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO product_images (product_id, image_url, isThumbnail) VALUES ?", [imageRows], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
};
module.exports = productModel;
