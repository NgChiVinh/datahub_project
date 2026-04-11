const mongoose = require("mongoose");

const studyCollectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    materialIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudyCollection", studyCollectionSchema);
