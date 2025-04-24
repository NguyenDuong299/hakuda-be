const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/checkRole.middleware");

router.get("/", orderController.getAllOrder);
router.post("/", orderController.createOrder);
// router.put("/:id", productController.updateProduct);
// router.delete("/:id", productController.deleteProduct);

module.exports = router;
