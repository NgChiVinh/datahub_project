const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["view", "download", "save_to_collection", "share"],
      required: true,
    },
    weight: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Interaction", interactionSchema);
