const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authController = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

      const requiredFields = [
        { key: "firstName", message: "Vui lòng nhập Tên" },
        { key: "lastName", message: "Vui lòng nhập Họ" },
        { key: "email", message: "Vui lòng nhập Email" },
        { key: "phoneNumber", message: "Vui lòng nhập Số điện thoại" },
        { key: "password", message: "Vui lòng nhập Mật khẩu" },
        { key: "confirmPassword", message: "Vui lòng xác nhận mật khẩu" },
      ];

      for (const field of requiredFields) {
        if (!req.body[field.key]) {
          return res.status(400).json({ message: field.message });
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }

      const phoneRegex = /^(0|\+84)[1-9][0-9]{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
      }

      const users = await User.getAll();

      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = { firstName, lastName, email, phoneNumber, password: hashedPassword };

      const result = await User.create(newUser);

      res.status(201).json({ id: result.insertId, firstName, lastName, email, phoneNumber });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  login: async (req, res) => {
    // console.log("secret key", SECRET_KEY);
    try {
      const { email, password } = req.body;
      const users = await User.getAll();
      const user = users.find((u) => u.email === email);
      if (!user) return res.status(404).json({ message: "User not found" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(401).json({ message: "Invalid password" });

      // Create JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "1h",
      });

      res.json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  logout: (req, res) => {
    // Nếu dùng JWT thì logout ở client (bằng cách xóa token), backend không xử lý gì.
    res.json({
      message: "Logged out successfully (client should discard token)",
    });
  },
};

module.exports = authController;
