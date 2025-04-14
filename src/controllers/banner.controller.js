const Banner = require("../models/banner.model");

const bannerController = {
  getAllBanners: (req, res) => {
    Banner.getAll()
      .then((banner) => res.json(banner))
      .catch((err) => res.status(500).send(err));
  },

  createBanner: (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Thương hiệu không được để trống" });
    }
    const newBanner = { name, description, image };
    Banner.create(newBanner)
      .then((result) => res.status(201).json({ id: result.insertId, ...newBanner }))
      .catch((err) => res.status(500).send(err));
  },
  updateBanner: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Banner.update(id, data)
      .then((result) => res.json({ message: "Banner updated" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deleteBanner: (req, res) => {
    const { id } = req.params;

    Banner.delete(id)
      .then(() => res.json({ message: "Banner deleted" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = bannerController;
