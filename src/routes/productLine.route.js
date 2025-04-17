const express = require("express");
const router = express.Router();
const productLineController = require("../controllers/productLine.controller");

router.get("/", productLineController.getAllProductLines);
router.post("/", productLineController.createProductLine);
router.put("/:id", productLineController.updateProductLine);
router.delete("/:id", productLineController.deleteProductLine);

module.exports = router;
