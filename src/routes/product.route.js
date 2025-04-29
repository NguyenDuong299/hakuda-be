const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/checkRole.middleware");

router.get("/", productController.getAllProducts);
router.get("/filter/new", productController.getNewProduct);
router.get("/filter/hot", productController.getHotProduct);
router.get("/filter/suggest", productController.getSugestProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
