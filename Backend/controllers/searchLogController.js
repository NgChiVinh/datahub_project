const SearchLog = require("../models/SearchLog");

//Tạo log tìm kiếm
exports.createSearchLog = async (req, res) => {
  try {
    const { searchQuery, clickedMaterialId } = req.body;

    const log = new SearchLog({
      userId: req.user ? req.user._id : null, // nếu chưa login vẫn log được
      searchQuery,
      clickedMaterialId: clickedMaterialId || null,
    });

    await log.save();

    res.status(201).json({
      message: "Tạo search log thành công",
      data: log,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Lấy tất cả log (admin)
exports.getAllSearchLogs = async (req, res) => {
  try {
    const logs = await SearchLog.find()
      .populate("userId", "name email")
      .populate("clickedMaterialId", "title")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Lấy log theo user
exports.getMySearchLogs = async (req, res) => {
  try {
    const logs = await SearchLog.find({ userId: req.user._id })
      .populate("clickedMaterialId", "title")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Xóa log (admin)
exports.deleteSearchLog = async (req, res) => {
  try {
    const log = await SearchLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Không tìm thấy log" });
    }

    res.json({ message: "Xóa log thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Thống kê từ khóa phổ biến
exports.getTopSearchKeywords = async (req, res) => {
  try {
    const result = await SearchLog.aggregate([
      {
        $group: {
          _id: "$searchQuery",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
