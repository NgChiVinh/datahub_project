const mongoose = require('mongoose');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function auditLikes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Auditing likes...");

    const materialsWithLikes = await Material.find({ likes: { $not: { $size: 0 } } });
    console.log(`Materials with likes: ${materialsWithLikes.length}`);

    materialsWithLikes.forEach(m => {
      console.log(`- Material: "${m.title}" has ${m.likes.length} likes. User IDs: ${m.likes.join(', ')}`);
    });

    if (materialsWithLikes.length === 0) {
      console.log("NO MATERIALS HAVE LIKES IN THE DATABASE.");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

auditLikes();
