const express = require("express");
const router = express.Router();

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  incrementDownload,
  toggleLike,
} = require("../controllers/materialController");

const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", getMaterials);
router.get("/:id", getMaterialById);
router.post("/:id/download", incrementDownload); // Route tăng lượt tải

// AUTH REQUIRED
router.post("/:id/like", authMiddleware, toggleLike); // Route like/unlike

// USER upload
router.post("/", authMiddleware, upload.single("file"), createMaterial);

// UPDATE
router.put("/:id", authMiddleware, upload.single("file"), updateMaterial);

// DELETE (admin)
router.delete("/:id", authMiddleware, isAdmin, deleteMaterial);

module.exports = router;
