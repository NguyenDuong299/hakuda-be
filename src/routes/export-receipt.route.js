const express = require("express");
const router = express.Router();
const exportReceiptController = require("../controllers/export-receipt.controller");

router.get("/", exportReceiptController.getAllExportReceipt);
router.get("/:id", exportReceiptController.getExportReceiptById);
router.get("/get/revenue", exportReceiptController.getTotalRevenue);
router.post("/", exportReceiptController.createExportReceipt);
router.put("/:id", exportReceiptController.updateExportReceipt);
router.delete("/:id", exportReceiptController.deleteExportReceipt);

module.exports = router;
