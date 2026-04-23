const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    majorId: { type: mongoose.Schema.Types.ObjectId, ref: "Major" },
    avatar: { type: String, default: "" },
    reputationPoints: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferences: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
