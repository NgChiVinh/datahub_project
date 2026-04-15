const Notification = require("../models/Notification");

// Lấy thông báo của user hiện tại
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông báo", error: error.message });
  }
};

// Đánh dấu đã đọc
const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thông báo", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
