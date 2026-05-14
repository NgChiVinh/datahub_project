const mongoose = require('mongoose');
const Category = require('../models/Category');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB...");

    const allCats = await Category.find();
    console.log(`Total Categories: ${allCats.length}`);

    const parents = allCats.filter(c => !c.parentId);
    console.log(`Parent Categories: ${parents.map(p => p.name).join(', ')}`);

    for (const p of parents) {
      const children = await Category.find({ parentId: p._id });
      console.log(`- ${p.name} has ${children.length} children.`);
      
      const childIds = children.map(c => c._id);
      const allIds = [p._id, ...childIds];
      
      const materialsCount = await Material.countDocuments({ categoryId: { $in: allIds } });
      const directMaterialsCount = await Material.countDocuments({ categoryId: p._id });
      
      console.log(`  => Total materials (incl. children): ${materialsCount}`);
      console.log(`  => Direct materials: ${directMaterialsCount}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();