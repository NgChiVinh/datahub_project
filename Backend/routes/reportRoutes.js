const express = require("express");
const router = express.Router();

const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// USER report
router.post("/", authMiddleware, createReport);

// ADMIN
router.get("/", authMiddleware, isAdmin, getReports);
router.get("/:id", authMiddleware, isAdmin, getReportById);
router.put("/:id", authMiddleware, isAdmin, updateReportStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteReport);

module.exports = router;
