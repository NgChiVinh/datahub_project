//middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  console.log("REQ HEADER TOKEN:", req.header("Authorization"));
  let token = req.header("Authorization");
  console.log("TOKEN RAW:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7); // Bỏ phần "Bearer "
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("SECRET_KEY:", process.env.SECRET_KEY);

    // Tìm user theo ID từ token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user; // Lưu user vào request để sử dụng trong các route tiếp theo
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token không hợp lệ" });
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
