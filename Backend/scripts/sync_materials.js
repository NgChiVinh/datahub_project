const mongoose = require('mongoose');
const Category = require('../models/Category');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function sync() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const materials = await Material.find().populate('categoryId');
    console.log(`Processing ${materials.length} materials...`);

    let updatedCount = 0;
    for (const m of materials) {
      if (m.categoryId && m.categoryId.majorId) {
        m.majorId = m.categoryId.majorId;
        await m.save();
        updatedCount++;
      } else {
        console.warn(`Warning: Material "${m.title}" has no valid category or category has no majorId.`);
      }
    }

    console.log(`Successfully synced majorId for ${updatedCount} materials.`);
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

sync();