const connection = require("../config/db");

const productModel = {
  getAllProduct: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `
      SELECT 
   p.*, 
   JSON_ARRAYAGG(
     CASE 
       WHEN pi.image_url IS NOT NULL AND pi.isThumbnail IS NOT NULL 
       THEN JSON_OBJECT('image_url', pi.image_url, 'isThumbnail', pi.isThumbnail)
       ELSE NULL
     END
   ) AS images
 FROM products p
 LEFT JOIN product_images pi ON p.id = pi.product_id
 WHERE p.name LIKE ? OR p.code LIKE ?
 GROUP BY p.id
 ORDER BY p.createdAt DESC
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
    const { images = [], stock_quantity, ...productData } = product;

    if (!Number.isInteger(stock_quantity) || stock_quantity <= 0) {
      return Promise.reject(new Error("Số lượng của sản phẩm phải lớn hơn 0!"));
    }

    const newProduct = {
      ...productData,
      stock_quantity,
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
            return resolve({ id: newId, ...productData, stock_quantity, code: newCode, images: [] });
          }

          const safeImages = Array.isArray(images) ? images : [];
          const imageRows = safeImages.map((img) => [newId, img.image_url, img.isThumbnail || false]);

          connection.query("INSERT INTO product_images (product_id, image_url, isThumbnail) VALUES ?", [imageRows], (err3) => {
            if (err3) return reject(err3);
            resolve({ id: newId, ...productData, stock_quantity, code: newCode, images });
          });
        });
      });
    });
  },

  getProductById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        p.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'image_url', pi.image_url, 
            'isThumbnail', pi.isThumbnail
          )
        ) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

      connection.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Trả về một object thay vì array
      });
    });
  },

  getNewProduct: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;

      const searchQuery = `%${search}%`;

      const sql = `
        SELECT 
          p.*, 
          JSON_ARRAYAGG(
            CASE 
              WHEN pi.image_url IS NOT NULL AND pi.isThumbnail IS NOT NULL 
              THEN JSON_OBJECT('image_url', pi.image_url, 'isThumbnail', pi.isThumbnail)
              ELSE NULL
            END
          ) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        ${search ? `WHERE p.name LIKE ?` : ""}
        GROUP BY p.id
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const params = search ? [searchQuery, limit, offset] : [limit, offset];

      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);

        results.forEach((item) => {
          try {
            if (typeof item.images === "string") {
              item.images = JSON.parse(item.images).filter((i) => i !== null);
            }
          } catch {
            item.images = [];
          }
        });

        resolve(results);
      });
    });
  },
  getHotProduct: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          p.*, 
          COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT('image_url', pi.image_url, 'isThumbnail', pi.isThumbnail)
            ),
            JSON_ARRAY()
          ) AS images
        FROM products p
        LEFT JOIN product_images pi 
          ON p.id = pi.product_id 
          AND pi.image_url IS NOT NULL 
          AND pi.isThumbnail IS NOT NULL
        WHERE p.hot = 1
        GROUP BY p.id
        ORDER BY p.createdAt DESC
      `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);

        results.forEach((item) => {
          try {
            if (typeof item.images === "string") {
              item.images = JSON.parse(item.images);
            }
          } catch {
            item.images = [];
          }
        });

        resolve(results);
      });
    });
  },
  getSugestProduct: () => {
    return new Promise((resolve, reject) => {
      const sql = `
     SELECT 
          p.*, 
          COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT('image_url', pi.image_url, 'isThumbnail', pi.isThumbnail)
            ),
            JSON_ARRAY()
          ) AS images
        FROM products p
        LEFT JOIN product_images pi 
          ON p.id = pi.product_id 
          AND pi.image_url IS NOT NULL 
          AND pi.isThumbnail IS NOT NULL
        GROUP BY p.id
      ORDER BY RAND()
      LIMIT 10
    `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);

        results.forEach((item) => {
          try {
            if (typeof item.images === "string") {
              item.images = JSON.parse(item.images);
            }
          } catch {
            item.images = [];
          }
        });
        resolve(results);
      });
    });
  },

  updateProduct: (id, product) => {
    const now = new Date();
    const { images = [], stock_quantity, ...productData } = product;

    if (!Number.isInteger(stock_quantity) || stock_quantity <= 0) {
      return Promise.reject(new Error("Số lượng của sản phẩm phải lớn hơn 0!"));
    }
    const newProduct = {
      ...productData,
      stock_quantity,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      connection.query("UPDATE products SET ? WHERE id = ?", [newProduct, id], (err, result) => {
        if (err) return reject(err);

        connection.query("DELETE FROM product_images WHERE product_id = ?", [id], (err2) => {
          if (err2) return reject(err2);

          if (images.length === 0) return resolve({ id, ...productData, stock_quantity, images: [] });

          const imageRows = images.map((url) => [id, url]);
          connection.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageRows], (err3) => {
            if (err3) return reject(err3);
            resolve({ id, ...productData, stock_quantity, images });
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
