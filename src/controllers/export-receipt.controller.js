const ExportReceipt = require("../models/export-receipt.model");
const Product = require("../models/product.model");

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
  getTotalRevenue: async (req, res) => {
    try {
      const totalRevenue = await ExportReceipt.getTotalRevenue();
      res.json({ totalRevenue });
    } catch (err) {
      console.error("Error:", err); // Log lỗi chi tiết
      res.status(500).json({ error: err.message });
    }
  },
  getTotalRevenueByDay: async (req, res) => {
    try {
      const totalRevenueByDay = await ExportReceipt.getRevenueByDay();
      res.json({ totalRevenueByDay });
    } catch (err) {
      console.error("Error:", err); // Log lỗi chi tiết
      res.status(500).json({ error: err.message });
    }
  },
  getTotalRevenueByWeek: async (req, res) => {
    try {
      const totalRevenueByWeek = await ExportReceipt.getRevenueByMonth();
      res.json({ totalRevenueByWeek });
    } catch (err) {
      console.error("Error:", err); // Log lỗi chi tiết
      res.status(500).json({ error: err.message });
    }
  },
  getTotalRevenueByMonth: async (req, res) => {
    try {
      const year = new Date().getFullYear();
      const totalRevenueByMonth = await ExportReceipt.getRevenueByMonth(year);
      res.json({ year, totalRevenueByMonth });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: err.message });
    }
  },
  getTotalRevenueByYear: async (req, res) => {
    try {
      const totalRevenueByYear = await ExportReceipt.getRevenueByYear();
      res.json({ totalRevenueByYear });
    } catch (err) {
      console.error("Error:", err); // Log lỗi chi tiết
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

      if (!export_date || !total_amount || !user_id || !status || export_receipt_details.length === 0) {
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

      const result = await ExportReceipt.updateExportReceipt(id, { status });

      if (status === "completed") {
        const details = await ExportReceipt.getExportReceiptById(id);
        const exportDetails = details.export_receipt_details;

        for (const item of exportDetails) {
          await Product.decrementQuantity(item.product_id, item.quantity);
        }
      }

      if (result) {
        res.json({ message: "Cập nhật biên lai thành công!" });
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
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
