const Report = require("../models/Report");
const Material = require("../models/Material");

// CREATE REPORT
const createReport = async (req, res) => {
  try {
    const { materialId, reason } = req.body;

    // check đã report chưa
    const existing = await Report.findOne({
      reporterId: req.user._id,
      materialId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã report tài liệu này rồi" });
    }

    const report = new Report({
      reporterId: req.user._id,
      materialId,
      reason,
    });

    await report.save();

    res.status(201).json({
      message: "Báo cáo thành công",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo report", error });
  }
};

// GET ALL REPORTS (ADMIN)
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "fullName email")
      .populate("materialId", "title fileUrl status")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET REPORT BY ID
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporterId", "fullName")
      .populate("materialId", "title fileUrl");

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy report" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE STATUS (ADMIN xử lý)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy report" });
    }

    report.status = status;
    await report.save();

    // nếu resolved → có thể ẩn material
    if (status === "resolved") {
      await Material.findByIdAndUpdate(report.materialId, {
        status: "hidden",
      });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái thành công",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi update", error });
  }
};

// DELETE REPORT (ADMIN)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy report" });
    }

    res.status(200).json({ message: "Xoá report thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá", error });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
};
