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
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return reject(new Error("Post not found"));
        }
        resolve(results[0]);
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

  deletePost: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = postModel;
