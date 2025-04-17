const ProductLine = require("../models/product.line.model");

const productLineController = {
  getAllProductLines: (req, res) => {
    ProductLine.getAll()
      .then((productLine) => res.json(productLine))
      .catch((err) => res.status(500).send(err));
  },

  createProductLine: (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Dòng sản phẩm không được để trống không được để trống" });
    }
    const newProductLine = { name, description };
    ProductLine.create(newProductLine)
      .then((result) => res.status(201).json({ id: result.insertId, ...newProductLine }))
      .catch((err) => res.status(500).send(err));
  },
  updateProductLine: (req, res) => {
    const { id } = req.params;
    const data = req.body;

    ProductLine.update(id, data)
      .then((result) => res.json({ message: "Đã cập nhật dòng sản phẩm" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
  deleteProductLine: (req, res) => {
    const { id } = req.params;

    ProductLine.delete(id)
      .then(() => res.json({ message: "Đã xoá" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = productLineController;
