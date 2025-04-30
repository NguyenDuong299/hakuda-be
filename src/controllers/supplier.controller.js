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
      const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Tên nhà cung cấp không được để trống" });
    }

    const existingSupplier = await Supplier.getAllSupplier();
    const isDuplicate = existingSupplier.some((v) => v.name === name);

    if (isDuplicate) {
      return res.status(400).json({ message: "Tên nhà cung cấp đã tồn tại!" });
    }

    const newSupplier = { name };
    Supplier.createSupplier(newSupplier)
      .then((result) =>
        res.status(201).json({
          id: result.insertId,
          ...newSupplier,
          message: "Thêm Supplier thành công!",
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
      console.log(data);
      if (!data.name) {
        return res
          .status(400)
          .json({ message: "Tên nhà cung cấp không được để trống" });
      }
      const existingSupplier = await Supplier.getAllSupplier();
      const isDuplicate = existingSupplier.some((v) => v.name === data.name);
  
      if (isDuplicate) {
        return res.status(400).json({ message: "Tên nhà cung cấp đã tồn tại!" });
      }
  
      Supplier.updateSupplier(id, data);
      res.json({ message: "Chỉnh sửa Supplier thành công!" });
    } catch (err) {
      res.status(500).json({"lỗi": err.message , "message": "Lỗi không xác định"});
      
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
      res.json({ message: "Xóa Supplier thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
};

module.exports = supplierController;
