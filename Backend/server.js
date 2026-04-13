const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load .env
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const userRoutes = require("./routes/userRoutes");
const majorRoutes = require("./routes/majorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const materialRoutes = require("./routes/materialRoutes");

// Sử dụng API routes
app.use("/api/users", userRoutes);
app.use("/api/majors", majorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/materials", materialRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API DataHub Running...");
});

// Lắng nghe server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
