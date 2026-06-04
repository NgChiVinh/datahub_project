const express = require("express");
const router = express.Router();

const {
  createSearchLog,
  getAllSearchLogs,
  getMySearchLogs,
  deleteSearchLog,
  getTopSearchKeywords,
} = require("../controllers/searchLogController");

const { authMiddleware, optionalAuth, isAdmin } = require("../middleware/authMiddleware");

router.post("/", optionalAuth, createSearchLog);

router.get("/me", authMiddleware, getMySearchLogs);

router.get("/", authMiddleware, isAdmin, getAllSearchLogs);

router.delete("/:id", authMiddleware, isAdmin, deleteSearchLog);

router.get(
  "/top/keywords",
  authMiddleware,
  isAdmin,
  getTopSearchKeywords,
);

module.exports = router;
