const express = require("express");
const router = express.Router();

const {
  createSearchLog,
  getAllSearchLogs,
  getMySearchLogs,
  deleteSearchLog,
  getTopSearchKeywords,
} = require("../controllers/searchLogController");

const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", optionalAuth, createSearchLog);

router.get("/me", authMiddleware, getMySearchLogs);

router.get("/", authMiddleware, adminMiddleware, getAllSearchLogs);

router.delete("/:id", authMiddleware, adminMiddleware, deleteSearchLog);

router.get(
  "/top/keywords",
  authMiddleware,
  adminMiddleware,
  getTopSearchKeywords,
);

module.exports = router;
