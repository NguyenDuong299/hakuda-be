const User = require("../models/user.model");

const userController = {
  getAllUsers: (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    User.getTotalUsers(search)
      .then((totalUsers) => {
        User.getAllUsers(limit, offset, search)
          .then((users) => {
            res.json({ page, totalUsers, users });
          })
          .catch((err) => res.status(500).send(err));
      })
      .catch((err) => res.status(500).send(err));
  },

  createUser: (req, res) => {
    const { firstName, lastName, email, phoneNumber } = req.body;
    const newUser = { firstName, lastName, email, phoneNumber };

    User.create(newUser)
      .then((result) => res.status(201).json({ id: result.insertId, ...newUser }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  getUserById: (req, res) => {
    const { id } = req.params;
    User.getById(id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
        res.json(user);
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    User.update(id, updatedUser)
      .then(() => res.json({ message: "Chỉnh sửa người dùng thành công!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  deleteUser: (req, res) => {
    const { id } = req.params;

    User.delete(id)
      .then(() => res.json({ message: "Đã xóa người dùng thành công!" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = userController;
