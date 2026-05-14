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
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, isAdmin, getUsers);
router.put("/:id/role", authMiddleware, isAdmin, updateUserRole);
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", authMiddleware, changePassword);

//  Chỉ người dùng đã login mới truy cập được profile
//  Lấy thông tin cá nhân
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Bạn đã truy cập vào trang cá nhân", user: req.user });
});

// Cập nhật thông tin cá nhân (bao gồm upload avatar)
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateUserProfile,
);

module.exports = router;
