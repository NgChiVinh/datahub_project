const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsByMaterial,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { authMiddleware } = require("../middleware/authMiddleware");

// cần login
router.use(authMiddleware);

// tạo review
router.post("/", createReview);

// lấy review theo material
router.get("/material/:materialId", getReviewsByMaterial);

// update
router.put("/:id", updateReview);

// delete
router.delete("/:id", deleteReview);

module.exports = router;
