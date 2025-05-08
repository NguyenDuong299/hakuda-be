const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/change-password",authMiddleware, authController.changePassword);
router.post("/admin-login", authController.loginAdmin);
router.post("/logout", authController.logout);
router.get("/my-profile", authMiddleware, authController.getMyProfile);

module.exports = router;
