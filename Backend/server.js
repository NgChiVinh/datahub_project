const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load .env
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Trust Nginx reverse proxy — cần thiết để express-rate-limit đọc đúng IP thực
// từ header X-Forwarded-For thay vì IP của proxy (127.0.0.1).
app.set("trust proxy", 1);

app.use(express.json());
app.use(cors());

// Import Routes
const userRoutes = require("./routes/userRoutes");
const majorRoutes = require("./routes/majorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const materialRoutes = require("./routes/materialRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchLogRoutes = require("./routes/searchLogRoutes");
const studyCollectionRoutes = require("./routes/studyCollectionRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

// Sử dụng API routes
app.use("/api/users", userRoutes);
app.use("/api/majors", majorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search-logs", searchLogRoutes);
app.use("/api/collections", studyCollectionRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API DataHub Running...");
});

// Global error handler — bắt lỗi từ multer, middleware, controller chưa được xử lý
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message, err.stack);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File quá lớn, tối đa 100MB" });
  }
  res.status(500).json({ message: err.message || "Lỗi server" });
});

// Lắng nghe server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
