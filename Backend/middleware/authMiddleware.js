//middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Không có token hợp lệ, truy cập bị từ chối" });
  }

  token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản này đã bị khóa" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" });
    }
    res.status(401).json({ message: "Token không hợp lệ hoặc đã bị thay đổi" });
  }
};

const optionalAuth = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Luôn chạy SAU authMiddleware (đã verify JWT + set req.user + check isActive).
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  next();
};

module.exports = { authMiddleware, optionalAuth, isAdmin };
