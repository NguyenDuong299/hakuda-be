const connection = require("../config/db");

const postModel = {
  getAllPost: (limit, offset, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;

      const sql = "SELECT * FROM posts WHERE title LIKE ? LIMIT ? OFFSET ?";
      connection.query(sql, [searchQuery, limit, offset], (err, results) => {
        if (err) return reject(err);
        results.map((post) => {
          post.hot = post.hot === 1 ? true : false;
          return post;
        });
        resolve(results);
      });
    });
  },
  getTotalPosts: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = "SELECT COUNT(*) AS total FROM posts WHERE title LIKE ?";

      connection.query(sql, [searchQuery], (err, results) => {
        if (err) reject(err);
        resolve(results[0].total);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          reject(new Error("Post not found"));
        }
        results.map((post) => {
          post.hot = post.hot === 1 ? true : false;
          return post;
        });
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
