const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByMaterial,
  updateComment,
  deleteComment,
  getAllComments,
} = require("../controllers/commentController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// lấy comment theo material (tree) - Public
router.get("/material/:materialId", getCommentsByMaterial);

// Các route sau đây cần login
router.use(authMiddleware);

// tạo comment / reply
router.post("/", createComment);

// update
router.put("/:id", updateComment);

// delete
router.delete("/:id", deleteComment);

router.get("/", authMiddleware, isAdmin, getAllComments);

module.exports = router;
