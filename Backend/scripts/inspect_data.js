
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Major = require("../models/Major");
const path = require("path");
require("dotenv").config({ path: require('path').join(__dirname, '../.env') });

const inspectData = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
    await mongoose.connect(process.env.MONGO_URI);
    const categories = await Category.find().populate("parentId").populate("majorId");
    const majors = await Major.find();
    
    console.log("--- MAJORS ---");
    majors.forEach(m => console.log(`[${m.majorCode}] ${m.name} (${m._id})`));
    
    console.log("\n--- CATEGORIES ---");
    categories.forEach(c => {
      console.log(`- ${c.name} (ID: ${c._id}) | Parent: ${c.parentId?.name || 'None'} | Major: ${c.majorId?.name || 'None'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspectData();
