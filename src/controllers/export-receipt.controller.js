const ExportReceipt = require("../models/export-receipt.model");

const exportReceiptController = {
  getAllExportReceipt: async (req, res) => {
    try {
      const exportReceipts = await ExportReceipt.getAllExportReceipt();
      res.json(exportReceipts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getExportReceiptById: async (req, res) => {
    try {
      const { id } = req.params;
      const exportReceipt = await ExportReceipt.getExportReceiptById(id);
      res.json(exportReceipt);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  createExportReceipt: async (req, res) => {
    try {
      const exportReceipt = await ExportReceipt.createExportReceipt(req.body);
      res.status(201).json(exportReceipt);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateExportReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      const exportReceipt = await ExportReceipt.updateExportReceipt(id, req.body);
      res.json(exportReceipt);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  deleteExportReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      await ExportReceipt.deleteExportReceipt(id);
      res.json({ message: "Xóa hóa đơn hàng thanh cong!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = exportReceiptController;
