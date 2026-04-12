const express = require("express");
const {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN
router.post("/", authMiddleware, isAdmin, createTag);
router.put("/:id", authMiddleware, isAdmin, updateTag);
router.delete("/:id", authMiddleware, isAdmin, deleteTag);

// PUBLIC
router.get("/", getTags);
router.get("/:id", getTagById);

module.exports = router;
