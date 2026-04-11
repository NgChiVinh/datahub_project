const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true },
); // Mặc định timestamps sẽ tạo ra createdAt và updatedAt

module.exports = mongoose.model("Report", reportSchema);
