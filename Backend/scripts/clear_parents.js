const mongoose = require("mongoose");
const Category = require("../models/Category");
const path = require("path");
require("dotenv").config({ path: require('path').join(__dirname, '../.env') });

const clearParentCategories = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB Atlas...");

    // Cập nhật tất cả category: set parentId = null
    const result = await Category.updateMany({}, { $set: { parentId: null } });
    console.log(`Thành công! Đã gỡ bỏ danh mục cha cho ${result.modifiedCount} môn học.`);

    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
};

clearParentCategories();
