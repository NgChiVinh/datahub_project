const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsByMaterial,
  updateReview,
  deleteReview,
  getAllReviews,
} = require("../controllers/reviewController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// lấy review theo material - Public
router.get("/material/:materialId", getReviewsByMaterial);

// Các route sau đây cần login
router.use(authMiddleware);

// tạo review
router.post("/", createReview);

// update
router.put("/:id", updateReview);

// delete
router.delete("/:id", deleteReview);

router.get("/", authMiddleware, isAdmin, getAllReviews);

module.exports = router;
