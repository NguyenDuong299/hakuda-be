const Brand = require("../models/brand.model");

const brandController = {
  getAllBrands: (req, res) => {
    Brand.getAll()
      .then((brand) => res.json(brand))
      .catch((err) => res.status(500).send(err));
  },

  createBrand: (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Thương hiệu không được để trống" });
    }
    const newBrand = { name, description, image };
    Brand.create(newBrand)
      .then((result) => res.status(201).json({ id: result.insertId, ...newBrand }))
      .catch((err) => res.status(500).send(err));
  },
  updateBrand: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Brand.update(id, data)
      .then((result) => res.json({ message: "Brand updated" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deleteBrand: (req, res) => {
    const { id } = req.params;

    Brand.delete(id)
      .then(() => res.json({ message: "Brand deleted" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = brandController;
