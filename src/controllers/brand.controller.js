const Brand = require("../models/brand.model");

const brandController = {
  getAllBrand: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalBrand = await Brand.getTotalBrand(search);
      const brands = await Brand.getAllBrand(limit, offset, search);

      res.json({ page, totalBrand, brands });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createBrand: async (req, res) => {
    try {
      const { name, description, image } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Vui lòng nhập tên thương hiệu!" });
      }

      const existingBrand = await Brand.getAllBrand();
      const isDuplicate = existingBrand.some((v) => v.name === name);

      if (isDuplicate) {
        return res.status(400).json({ message: "Tên thương hiệu đã tồn tại!" });
      }

      const newBrand = { name, description, image };
      const result = await Brand.createBrand(newBrand);

      res.status(201).json({
        id: result.insertId,
        ...newBrand,
        message: "Thêm thương hiệu thành công!",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateBrand: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existingBrand = await Brand.getAllBrand();
      const isDuplicate = existingBrand.some((v) => v.name === data.name && v.id !== parseInt(id));

      if (isDuplicate) {
        return res.status(400).json({ message: "Tên thương hiệu đã tồn tại!" });
      }

      await Brand.updateBrand(id, data);
      res.json({ message: "Chỉnh sửa thương hiệu thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteBrand: async (req, res) => {
    try {
      const { id } = req.params;
      await Brand.deleteBrand(id);
      res.json({ message: "Xóa thương hiệu thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = brandController;
