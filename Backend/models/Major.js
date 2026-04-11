const mongoose = require("mongoose");

const majorSchema = new mongoose.Schema(
  {
    majorCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Major", majorSchema);
