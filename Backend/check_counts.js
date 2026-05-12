const mongoose = require('mongoose');
const Material = require('./models/Material');
require('dotenv').config();

async function checkCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/datahub');
    const docsCount = await Material.countDocuments({ materialType: { $ne: 'video' } });
    const videoCount = await Material.countDocuments({ materialType: 'video' });
    console.log('DOCS_COUNT:' + docsCount);
    console.log('VIDEO_COUNT:' + videoCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();