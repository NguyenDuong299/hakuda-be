const ExportReceipt = require("../models/export-receipt.model");

const exportReceiptController = {
  getAllExportReceipt: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalExportReceipt = await ExportReceipt.getTotalExportReceipt(search);
      const exportReceipts = await ExportReceipt.getAllExportReceipt(limit, offset, search);
      res.json({ page, totalExportReceipt, exportReceipts });
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
      const { order_id, export_date, total_amount, user_id, status, export_receipt_details = [] } = req.body;

      if (!order_id || !export_date || !total_amount || !user_id || !status || export_receipt_details.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin biên lai!" });
      }
      const result = await ExportReceipt.createExportReceipt({
        order_id,
        export_date,
        total_amount,
        user_id,
        status,
        export_receipt_details,
      });
      res.status(201).json(result);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: "Lỗi khi tạo biên lai.", error: err.message });
    }
  },
  updateExportReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await ExportReceipt.updateExportReceipt(id, {
        status,
      });
      res.json({ message: "Chỉnh sửa biên lai thành công!", result });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi cập nhật biên lai.", error: err.message });
    }
  },
  deleteExportReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      await ExportReceipt.deleteExportReceipt(id);
      res.json({ message: "Xóa biên lai thành công!" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa biên lai.", error: err.message });
    }
  },
};

module.exports = exportReceiptController;
