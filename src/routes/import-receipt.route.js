const express = require("express");
const router = express.Router();
const importReceiptController = require("../controllers/import-receipt.controller");

router.get("/", importReceiptController.getAllImportReceipt);
// router.get("/:id", importReceiptController.getExportReceiptById);
router.post("/", importReceiptController.createImportReceipt);
// router.put("/:id", importReceiptController.updateExportReceipt);
// router.delete("/:id", importReceiptController.deleteExportReceipt);

module.exports = router;
