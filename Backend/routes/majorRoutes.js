const express = require("express");
const router = express.Router();

const {
  createMajor,
  getMajors,
  getMajorById,
  updateMajor,
  deleteMajor,
} = require("../controllers/majorController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC (tuỳ bạn muốn)
router.get("/", getMajors);
router.get("/:id", getMajorById);

// ADMIN ONLY
router.post("/", authMiddleware, isAdmin, createMajor);
router.put("/:id", authMiddleware, isAdmin, updateMajor);
router.delete("/:id", authMiddleware, isAdmin, deleteMajor);

module.exports = router;
