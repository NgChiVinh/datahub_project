const express = require("express");
const router = express.Router();

const {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addMaterialToCollection,
  removeMaterialFromCollection,
} = require("../controllers/studyCollectionController");

const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

// GET endpoints use optionalAuth to allow viewing public collections
router.get("/", optionalAuth, getCollections);
router.get("/:id", optionalAuth, getCollectionById);

// tất cả các route khác cần login
router.use(authMiddleware);

// CRUD
router.post("/", createCollection);
router.put("/:id", updateCollection);
router.delete("/:id", deleteCollection);

// thêm/xoá tài liệu
router.post("/:id/materials", addMaterialToCollection);
router.delete("/:id/materials", removeMaterialFromCollection);

module.exports = router;
