const connection = require("../config/db");

const postModel = {
  getAllPost: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM posts", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  createPost: (post) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO posts SET ?", post, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  updatePost: (id, post) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE posts SET ? WHERE id = ?", [post, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = postModel;
