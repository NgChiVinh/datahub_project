const mongoose = require('mongoose');
const Category = require('../models/Category');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function deepCheck() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("--- DATABASE DEEP CHECK ---");

    // 1. Get all materials and their current category links
    const materials = await Material.find().populate('categoryId');
    console.log(`Total Materials in DB: ${materials.length}`);
    
    materials.forEach(m => {
      console.log(`- Material: "${m.title}"`);
      console.log(`  Status: ${m.status}`);
      console.log(`  Category: ${m.categoryId ? m.categoryId.name : 'NULL'} (ID: ${m.categoryId ? m.categoryId._id : 'N/A'})`);
      console.log(`  Parent ID: ${m.categoryId ? m.categoryId.parentId : 'N/A'}`);
    });

    // 2. Check the specific "Công nghệ Phần mềm (SE)" parent
    const seParent = await Category.findOne({ name: /Công nghệ Phần mềm/i });
    if (seParent) {
      console.log(`\nParent found: ${seParent.name} (${seParent._id})`);
      const children = await Category.find({ parentId: seParent._id });
      const childIds = children.map(c => c._id);
      console.log(`Children IDs: ${childIds.join(', ')}`);
      
      const matchApproved = await Material.countDocuments({ 
        categoryId: { $in: [seParent._id, ...childIds] },
        status: 'approved'
      });
      const matchAll = await Material.countDocuments({ 
        categoryId: { $in: [seParent._id, ...childIds] }
      });
      
      console.log(`Approved materials under SE or children: ${matchApproved}`);
      console.log(`Total materials under SE or children: ${matchAll}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deepCheck();