const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ["upload", "link"],
      default: "upload",
    },
    materialType: {
      type: String,
      enum: ["pdf", "docx", "zip", "video", "pptx", "other"],
      required: true,
    },
    academicYear: {
      type: String,
      enum: ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Khác"],
      default: "Khác",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    majorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Major",
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "pending",
    },
    metrics: {
      viewCount: { type: Number, default: 0 },
      downloadCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
    embedding: { type: [Number], default: [] },
    // Text trích từ nội dung file (PDF/docx) - dùng cho hybrid filter (lọc từ khóa)
    // và là nền cho full-text search. Không hiển thị trực tiếp cho người dùng.
    contentText: { type: String, default: "", select: false },
    // Embedding CHỈ từ tiêu đề + mô tả (baseline để đánh giá so sánh trước/sau
    // khi đưa nội dung file vào embedding). Chỉ dùng cho script đánh giá.
    embeddingTitleOnly: { type: [Number], default: [], select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Material", materialSchema);
