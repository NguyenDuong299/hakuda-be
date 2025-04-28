const Product = require("../models/product.model");

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalProduct = await Product.getTotalProduct(search);
      const products = await Product.getAllProduct(limit, offset, search);

      res.json({ page, totalProduct, products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { name, description, detail, price, stock_quantity, isDiscount, hot, brand_id, product_line_id, images } = req.body;

      if (!name || !price || !stock_quantity) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ các trường!" });
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
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, detail, price, stock_quantity, isDiscount, hot, brand_id, product_line_id, images } = req.body;
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
        stock_quantity,
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
