const express = require("express");
const router = express.Router();

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", getMaterials);
router.get("/:id", getMaterialById);

// USER upload
router.post("/", authMiddleware, upload.single("file"), createMaterial);

// UPDATE
router.put("/:id", authMiddleware, upload.single("file"), updateMaterial);

// DELETE (admin)
router.delete("/:id", authMiddleware, isAdmin, deleteMaterial);

module.exports = router;
