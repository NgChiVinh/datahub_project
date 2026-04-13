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

const isAdmin = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Giải mã token
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    req.user = user; // Lưu thông tin user vào request
    next();
  } catch (error) {
    res.status(401).json({ message: "Xác thực thất bại", error });
  }
};

module.exports = { authMiddleware, isAdmin };
