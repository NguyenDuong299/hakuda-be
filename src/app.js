const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const userRoutes = require("./routes/user.route");
const brandRoutes = require("./routes/brand.route");
const authRoutes = require("./routes/auth.route");
const productLineRoutes = require("./routes/productLine.route");
const postRoutes = require("./routes/post.route");
const bannerRoutes = require("./routes/banner.route");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the original extension
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "")));
app.use("/public", express.static(path.join(__dirname, "public"))); // Serve static files from the 'uploads' folder

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/product_lines", productLineRoutes);
app.use("/api/posts", postRoutes);

// Add the file upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Send back the path of the uploaded file
  res.json({ path: `/public/${req.file.filename}` });
  console.log(req.file);
});

module.exports = app;
