const express = require("express");
const router = express.Router();

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  incrementDownload,
  proxyDownload,
  toggleLike,
  getMaterialStats,
} = require("../controllers/materialController");

const upload = require("../middleware/multer");
const { authMiddleware, isAdmin, optionalAuth } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", getMaterials);
router.get("/stats", authMiddleware, isAdmin, getMaterialStats);
router.get("/:id", optionalAuth, getMaterialById);
router.post("/:id/download", optionalAuth, incrementDownload);
router.get("/:id/download", optionalAuth, proxyDownload);

// AUTH REQUIRED
router.post("/:id/like", authMiddleware, toggleLike);

// USER UPLOAD
router.post("/", authMiddleware, upload.single("file"), createMaterial);

// UPDATE
router.put("/:id", authMiddleware, upload.single("file"), updateMaterial);

// DELETE (chủ sở hữu hoặc admin — kiểm tra quyền trong controller)
router.delete("/:id", authMiddleware, deleteMaterial);

module.exports = router;