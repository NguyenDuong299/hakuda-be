const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  }
};

module.exports = checkAdmin;
