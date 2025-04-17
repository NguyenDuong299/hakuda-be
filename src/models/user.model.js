const connection = require("../config/db");

const UserModel = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM users", (err, results) => {
        if (err) reject(err);
        results.map((user) => {
          user.role = user.role === "1" ? "admin" : "user";
          return user;
        });
        resolve(results);
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        if (results.length === 0) {
          reject(new Error("User not found"));
        }
        results.map((user) => {
          user.role = user.role === 1 ? "admin" : "user";
          return user;
        });
        resolve(results[0]);
      });
    });
  },
  create: (user) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO users SET ?", user, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  update: (id, user) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE users SET ? WHERE id = ?", [user, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = UserModel;
