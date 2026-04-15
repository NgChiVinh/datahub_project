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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Material", materialSchema);
