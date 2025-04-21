const connection = require("../config/db");

const bannerModel = {
  getAllBanner: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM banners", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  createBanner: (banner) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO banners SET ?", banner, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  updateBanner: (id, banner) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE banners SET ? WHERE id = ?", [banner, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  deleteBanner: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM banners WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = bannerModel;
