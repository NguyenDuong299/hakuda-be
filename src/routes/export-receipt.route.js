const express = require("express");
const router = express.Router();
const exportReceiptController = require("../controllers/export-receipt.controller");

router.get("/", exportReceiptController.getAllExportReceipt);
router.post("/", exportReceiptController.createExportReceipt);
router.put("/:id", exportReceiptController.updateExportReceipt);
router.delete("/:id", exportReceiptController.deleteExportReceipt);

module.exports = router;
