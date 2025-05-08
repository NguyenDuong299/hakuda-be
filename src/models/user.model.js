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
  getAllUsers: (limit = null, offset = null, search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;

      let sql = `SELECT * FROM users 
      WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)
      AND role != 1`;
      const params = [searchQuery, searchQuery, searchQuery, searchQuery];

      if (Number.isInteger(limit) && Number.isInteger(offset)) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        if (!results) return resolve([]);
        const users = results.map((user) => ({
          ...user,
          role: user.role === "1" ? "admin" : "user",
        }));
        resolve(users);
      });
    });
  },
  getTotalUsers: (search = "") => {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${search}%`;
      const sql = `SELECT COUNT(*) AS total 
      FROM users 
      WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phoneNumber LIKE ?) 
      AND role != 1`;
      connection.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) reject(err);
        resolve(results[0].total);
      });
    });
  },
  getAllAdmin: () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM users WHERE role = 1", (err, results) => {
        if (err) reject(err);
        results.map((user) => {
          user.role = user.role === "1" ? "admin" : "user";
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
          user.role = user.role === "1" ? "admin" : "user";
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
      connection.query("SELECT role FROM users WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error("Không tìm thấy người dùng."));

        const role = results[0].role;
        if (role === "1") {
          return reject(new Error("Không thể chỉnh sửa người dùng admin."));
        }

        connection.query("UPDATE users SET ? WHERE id = ?", [user, id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT role FROM users WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error("Không tìm thấy người dùng."));

        const role = results[0].role;
        if (role === "1") {
          return reject(new Error("Không thể xóa người dùng admin."));
        }

        connection.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    });
  },
};

module.exports = UserModel;
