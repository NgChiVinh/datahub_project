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

const { authMiddleware } = require("../middleware/authMiddleware");

// tất cả cần login
router.use(authMiddleware);

// CRUD
router.post("/", createCollection);
router.get("/", getCollections);
router.get("/:id", getCollectionById);
router.put("/:id", updateCollection);
router.delete("/:id", deleteCollection);

// thêm/xoá tài liệu
router.post("/:id/materials", addMaterialToCollection);
router.delete("/:id/materials", removeMaterialFromCollection);

module.exports = router;
