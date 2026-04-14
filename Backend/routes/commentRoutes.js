const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByMaterial,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const { authMiddleware } = require("../middleware/authMiddleware");

// cần login
router.use(authMiddleware);

// tạo comment / reply
router.post("/", createComment);

// lấy comment theo material (tree)
router.get("/material/:materialId", getCommentsByMaterial);

// update
router.put("/:id", updateComment);

// delete
router.delete("/:id", deleteComment);

module.exports = router;
