const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Route lấy tài liệu tương tự
router.get("/similar/:materialId", recommendationController.getSimilarMaterials);

// Route tìm kiếm ngữ nghĩa
router.get("/search", recommendationController.searchSemantic);

// Route gợi ý cá nhân hóa (cần đăng nhập)
router.get("/for-you", authMiddleware, recommendationController.getForYou);

module.exports = router;
