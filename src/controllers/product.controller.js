const Product = require("../models/product.model");

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const brandId = req.query.brandId || "";
      const productLineId = req.query.productLineId || "";
      const minPrice = req.query.minPrice || null;
      const maxPrice = req.query.maxPrice || null;
      const orderBy = req.query.sortBy || "default";
      const totalProduct = await Product.getTotalProduct(search, brandId, productLineId, minPrice, maxPrice);
      const products = await Product.getAllProduct(limit, offset, search, brandId, productLineId, minPrice, maxPrice, orderBy);
      res.json({ page, totalProduct, products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description, detail, price, stock_quantity = 0, isDiscount, hot, brand_id, product_line_id, images } = req.body;

      if (!name || !price) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ các trường!" });
      }

      if (price > 99999999) {
        return res.status(400).json({ message: "Giá quá lớn!" });
      }

      const existingProduct = await Product.getAllProduct();
      const isDuplicate = existingProduct.some((v) => v.name === name);

      if (isDuplicate) {
        return res.status(400).json({ message: "Sản phẩm đã tồn tại!" });
      }

      const newProduct = { name, description, detail, price, stock_quantity, isDiscount, hot, brand_id, product_line_id, images };
      const result = await Product.createProduct(newProduct);

      res.status(201).json({
        id: result.insertId,
        ...newProduct,
        message: "Thêm sản phẩm thành công!",
        images: result.images || [],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getNewProduct: async (req, res) => {
    try {
      const products = await Product.getNewProduct();
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getHotProduct: async (req, res) => {
    try {
      const products = await Product.getHotProduct();
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.getProductById(id);
      res.json({ product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getSugestProduct: async (req, res) => {
    try {
      const products = await Product.getSugestProduct();
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getBestSellerProduct: async (req, res) => {
    try {
      const products = await Product.getBestSellerProduct();
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getRelatedProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const products = await Product.getRelatedProduct(id);
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, detail, price, isDiscount, hot, brand_id, product_line_id, images } = req.body;
      const existingProduct = await Product.getAllProduct();
      const isDuplicate = existingProduct.some((v) => v.name === name && v.id !== parseInt(id));
      if (isDuplicate) {
        return res.status(400).json({ message: "Sản phẩm đã tồn tại!" });
      }
      const productData = {
        name,
        description,
        detail,
        price,
        isDiscount,
        hot,
        brand_id,
        product_line_id,
      };
      await Product.updateProduct(id, productData);
      if (images) {
        await Product.deleteProductImages(id);
        if (images.length > 0) {
          const imageRows = images.map((url) => [id, url.image_url, url.isThumbnail]);
          await Product.addProductImages(imageRows);
        }
      }

      res.json({ message: "Chỉnh sửa sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await Product.deleteProduct(id);
      res.json({ message: "Xóa sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = productController;
