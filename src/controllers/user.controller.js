const User = require("../models/user.model");

const userController = {
  getAllUsers: (req, res) => {
    User.getAll()
      .then((users) => res.json(users))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  createUser: (req, res) => {
    const { firstName, lastName, email, phone } = req.body;
    const newUser = { firstName, lastName, email, phone };

    User.create(newUser)
      .then((result) =>
        res.status(201).json({ id: result.insertId, ...newUser })
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    User.update(id, updatedUser)
      .then(() => res.json({ message: "User updated successfully" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  deleteUser: (req, res) => {
    const { id } = req.params;

    User.delete(id)
      .then(() => res.json({ message: "User deleted successfully" }))
      .catch((err) => res.status(500).json({ error: err.message }));
  },
};

module.exports = userController;
