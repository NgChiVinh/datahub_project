const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    searchQuery: { type: String, required: true },
    clickedMaterialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SearchLog", searchLogSchema);
