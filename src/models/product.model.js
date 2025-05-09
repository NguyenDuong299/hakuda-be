const connection = require("../config/db");

const productModel = {
  getAllProduct: (limit, offset, search = "", brandId = "", productLineId = "", minPrice = null, maxPrice = null, sortBy) => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      limit = parseInt(limit) || 10;
      offset = parseInt(offset) || 0;

      let conditions = `(p.name LIKE ? OR p.code LIKE ?)`;
      const values = [searchQuery, searchQuery];
      let orderClause = "ORDER BY p.createdAt DESC"; // mặc định

      switch (sortBy) {
        case "nameAsc":
          orderClause = "ORDER BY p.name ASC";
          break;
        case "nameDesc":
          orderClause = "ORDER BY p.name DESC";
          break;
        case "priceAsc":
          orderClause = "ORDER BY p.price ASC";
          break;
        case "priceDesc":
          orderClause = "ORDER BY p.price DESC";
          break;
        case "newest":
          orderClause = "ORDER BY p.createdAt DESC";
          break;
        case "oldest":
          orderClause = "ORDER BY p.createdAt ASC";
          break;
      }
      if (brandId) {
        conditions += " AND p.brand_id = ?";
        values.push(brandId);
      }

      if (productLineId) {
        conditions += " AND p.product_line_id = ?";
        values.push(productLineId);
      }

      if (minPrice !== null) {
        conditions += " AND p.price >= ?";
        values.push(minPrice);
      }

      if (maxPrice !== null) {
        conditions += " AND p.price <= ?";
        values.push(maxPrice);
      }

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
      WHERE ${conditions}
      GROUP BY p.id
       ${orderClause}
      LIMIT ? OFFSET ?
    `;

      values.push(limit, offset);

      connection.query(sql, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  getTotalProduct: (search = "", brandId = "", productLineId = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      let conditions = `(name LIKE ? OR code LIKE ?)`;
      const values = [searchQuery, searchQuery];

      if (brandId) {
        conditions += " AND brand_id = ?";
        values.push(brandId);
      }

      if (productLineId) {
        conditions += " AND product_line_id = ?";
        values.push(productLineId);
      }

      const sql = `
        SELECT COUNT(*) AS total 
        FROM products 
        WHERE ${conditions}
      `;

      connection.query(sql, values, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  },
  getBestSellerProducts: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          p.*, 
          IFNULL(SUM(oi.quantity), 0) AS total_sold,
          JSON_ARRAYAGG(
            CASE 
              WHEN pi.image_url IS NOT NULL AND pi.isThumbnail IS NOT NULL 
              THEN JSON_OBJECT('image_url', pi.image_url, 'isThumbnail', pi.isThumbnail)
              ELSE NULL
            END
          ) AS images
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
      `;

      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        results.forEach((item) => {
          if (!item.images || item.images.every((i) => i === null)) {
            item.images = [];
          }
        });
        resolve(results);
      });
    });
  },
  createProduct: (product) => {
    const now = new Date();
    const { images = [], stock_quantity, ...productData } = product;

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
  getRelatedProduct: (id) => {
    return new Promise((resolve, reject) => {
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
        WHERE p.id != ? AND (
          p.brand_id = (SELECT brand_id FROM products WHERE id = ?)
          OR p.product_line_id = (SELECT product_line_id FROM products WHERE id = ?)
        )
        GROUP BY p.id
        LIMIT 4
      `;

      connection.query(sql, [id, id, id], (err, results) => {
        if (err) return reject(err);
        results.forEach((item) => {
          if (!item.images || item.images.every((i) => i === null)) {
            item.images = [];
          }
        });
        resolve(results);
      });
    });
  },
  getProductById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          p.*, 
          b.name AS brand_name,
          pl.name AS product_line_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'image_url', pi.image_url, 
              'isThumbnail', pi.isThumbnail
            )
          ) AS images
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN product_lines pl ON p.product_line_id = pl.id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = ?
        GROUP BY p.id
      `;

      connection.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
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
  updateStockQuantity: (productId, newQuantity) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE products SET stock_quantity = ?, updatedAt = ? WHERE id = ?`;
      const now = new Date();
      connection.query(sql, [newQuantity, now, productId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
  decrementQuantity: (productId, quantity) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`;
      connection.query(sql, [quantity, productId, quantity], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error("Sản phẩm không đủ số lượng để xuất kho."));
        }
        resolve(result);
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
