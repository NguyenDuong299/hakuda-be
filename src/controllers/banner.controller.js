const Banner = require("../models/banner.model");

const bannerController = {
  getAllBanner: (req, res) => {
    const search = req.query.search || "";
    Banner.getAllBanner(search)
      .then((banners) => res.json({ banners }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  createBanner: (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Thương hiệu không được để trống" });
    }
    const newBanner = { name, description, image };
    Banner.createBanner(newBanner)
      .then((result) => res.status(201).json({ id: result.insertId, ...newBanner, message: "Thêm Banner thành công!" }))
      .catch((err) => res.status(500).send(err));
  },
  updateBanner: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Banner.updateBanner(id, data)
      .then((result) => res.json({ message: "Chỉnh sửa Banner thành công!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deleteBanner: (req, res) => {
    const { id } = req.params;

    Banner.deleteBanner(id)
      .then(() => res.json({ message: "Banner deleted" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = bannerController;
