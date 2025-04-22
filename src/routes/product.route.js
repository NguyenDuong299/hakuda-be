const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/checkRole.middleware");

router.get("/", productController.getAllProducts);

module.exports = router;
