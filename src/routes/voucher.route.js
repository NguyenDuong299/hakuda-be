const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher.controller");

router.get("/", voucherController.getAllVoucher);
router.get("/check/:code", voucherController.checkVoucher);
router.post("/", voucherController.createVoucher);
router.put("/:id", voucherController.updateVoucher);
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
