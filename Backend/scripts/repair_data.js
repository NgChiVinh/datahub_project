const mongoose = require('mongoose');
const Category = require('../models/Category');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function repair() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Repairing data...");

    // 1. Tìm mục "Kiến thức Cơ sở ngành" để làm mặc định
    const coreParent = await Category.findOne({ name: /Kiến thức Cơ sở ngành/i });
    if (!coreParent) {
      console.log("Core category not found, skipping repair.");
      process.exit(0);
    }

    // 2. Tìm các bài viết bị mồ côi (categoryId null hoặc không tồn tại)
    const materials = await Material.find();
    let repairCount = 0;
    
    for (const m of materials) {
      const exists = m.categoryId ? await Category.findById(m.categoryId) : null;
      if (!m.categoryId || !exists) {
        m.categoryId = coreParent._id;
        await m.save();
        repairCount++;
      }
    }

    console.log(`Repaired ${repairCount} orphan materials.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repair();