const Supplier = require("../models/supplier.model");

const supplierController = {
  getAllSupplier: (req, res) => {
    Supplier.getAllSupplier()
      .then((suppliers) => res.json({ suppliers }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  getSupplierById: async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await Supplier.getSupplierById(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier khum tồn tại!" });
      }
      res.json({ supplier });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createSupplier: async (req, res) => {
    try {
      const { name, email, phoneNumber } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Tên nhà cung cấp không được để trống" });
      }
      const newSupplier = { name, email, phoneNumber };
      Supplier.createSupplier(newSupplier).then((result) =>
        res.status(201).json({
          id: result.insertId,
          ...newSupplier,
          message: "Thêm nhà cung cấp thành công!",
        })
      );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: "Tên nhà cung cấp không được để trống" });
      }
      data.updatedAt = new Date();
      await Supplier.updateSupplier(id, data); // Thêm await nếu hàm trả Promise
      res.json({ message: "Chỉnh sửa nhà cung cấp thành công!" });
    } catch (err) {
      res.status(500).json({ lỗi: err.message, message: "Lỗi không xác định" });
    }
  },

  deleteSupplier: async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await Supplier.getSupplierById(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier không tồn tại!" });
      }

      await Supplier.deleteSupplier(id);
      res.json({ message: "Xóa nhà cung cấp thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = supplierController;
