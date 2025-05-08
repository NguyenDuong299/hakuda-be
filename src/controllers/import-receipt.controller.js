const ImportReceipt = require("../models/import-receipt.model");
const Product = require("../models/product.model");

const importReceiptController = {
  getAllImportReceipt: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const totalImportReceipt = await ImportReceipt.getAllImportReceipt(search);
      const importReceipts = await ImportReceipt.getAllImportReceipt(limit, offset, search);
      res.json({ page, totalImportReceipt, importReceipts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createImportReceipt: async (req, res) => {
    try {
      const { supplier_id, import_date, total_amount, note, import_receipt_details = [] } = req.body;

      if (!supplier_id || !import_date || !total_amount || !note || import_receipt_details.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin hoá đơn!" });
      }
      const result = await ImportReceipt.createImportReceipt({
        supplier_id,
        import_date,
        total_amount,
        note,
        import_receipt_details,
      });
      for (const item of import_receipt_details) {
        const product = await Product.getProductById(item.product_id);
        if (product) {
          const newQuantity = product.stock_quantity + item.quantity;
          await Product.updateStockQuantity(item.product_id, newQuantity);
        }
      }
      res.status(201).json(result);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: "Lỗi khi tạo biên lai.", error: err.message });
    }
  },
};

module.exports = importReceiptController;
