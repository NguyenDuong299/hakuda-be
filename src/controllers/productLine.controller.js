const ProductLine = require("../models/productLine.model");

const productLineController = {
  getAllProductLine: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalProductLine = await ProductLine.getTotalProductLine(search);
      const productLines = await ProductLine.getAllProductLine(limit, offset, search);

      res.json({ page, totalProductLine, productLines });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createProductLine: async (req, res) => {
    try {
      const { name, description, image } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Vui lòng nhập tên dòng sản phẩm!" });
      }

      const existingProductLines = await ProductLine.getAllProductLine();
      const isDuplicate = existingProductLines.some((v) => v.name === name);

      if (isDuplicate) {
        return res.status(400).json({ message: "Tên dòng sản phẩm đã tồn tại!" });
      }

      const newProductLine = { name, description, image };
      const result = await ProductLine.createProductLine(newProductLine);

      res.status(201).json({
        id: result.insertId,
        ...newProductLine,
        message: "Thêm dòng sản phẩm thành công!",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateProductLine: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existingProductLines = await ProductLine.getAllProductLine();
      const isDuplicate = existingProductLines.some((v) => v.name === data.name && v.id !== parseInt(id));

      if (isDuplicate) {
        return res.status(400).json({ message: "Tên dòng sản phẩm đã tồn tại!" });
      }

      await ProductLine.updateProductLine(id, data);
      res.json({ message: "Chỉnh sửa dòng sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteProductLine: async (req, res) => {
    try {
      const { id } = req.params;
      await ProductLine.deleteProductLine(id);
      res.json({ message: "Xóa dòng sản phẩm thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = productLineController;
