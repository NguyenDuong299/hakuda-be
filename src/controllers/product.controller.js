const Product = require("../models/product.model");

const productController = {
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      Product.getAllProduct()
        .then((results) => {
          resolve(results);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

module.exports = productController;
