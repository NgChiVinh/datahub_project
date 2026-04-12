const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);


router.get("/", getCategories);
router.get("/:id", getCategoryById);

module.exports = router;
