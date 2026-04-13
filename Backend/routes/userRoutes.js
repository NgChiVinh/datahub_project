//routes/userRoutes.js
const express = require("express");
const {
  getUsers,
  registerUser,
  loginUser,
  getMe,
  updateUserRole,
  deleteUser,
  updateUserProfile,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, isAdmin, getUsers);
router.put("/:id/role", authMiddleware, isAdmin, updateUserRole);
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

//  Chỉ người dùng đã login mới truy cập được profile
//  Lấy thông tin cá nhân
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Bạn đã truy cập vào trang cá nhân", user: req.user });
});

// Cập nhật thông tin cá nhân
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;
