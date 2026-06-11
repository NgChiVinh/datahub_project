const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const recommendationController = require("../controllers/recommendationController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Giới hạn cho các endpoint gọi OpenAI API
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Quá nhiều yêu cầu AI, vui lòng thử lại sau." },
});

// Giới hạn chặt hơn cho chat và quiz (tốn token hơn)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Bạn hỏi quá nhanh, chờ chút nhé." },
});

// Route lấy tài liệu tương tự
router.get("/similar/:materialId", recommendationController.getSimilarMaterials);

// Route tìm kiếm ngữ nghĩa (gọi OpenAI → cần rate limit)
router.get("/search", aiLimiter, recommendationController.searchSemantic);

// Route gợi ý cá nhân hóa (cần đăng nhập + gọi OpenAI)
router.get("/for-you", aiLimiter, authMiddleware, recommendationController.getForYou);

// RAG chat — hỏi AI về nội dung 1 tài liệu cụ thể (public, no auth required)
router.post("/chat", chatLimiter, recommendationController.chatDocument);

// Quiz tự động từ nội dung tài liệu (public, no auth required)
router.post("/quiz", chatLimiter, recommendationController.quizDocument);

module.exports = router;
