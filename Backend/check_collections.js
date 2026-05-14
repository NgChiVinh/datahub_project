const mongoose = require('mongoose');
const StudyCollection = require('./models/StudyCollection');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const collections = await StudyCollection.find().populate('userId').populate('materialIds');
    console.log(`Found ${collections.length} collections.`);

    for (const col of collections) {
      console.log(`- Collection: ${col.name} (ID: ${col._id})`);
      console.log(`  User: ${col.userId?.fullName || 'Unknown'} (ID: ${col.userId?._id})`);
      console.log(`  Materials: ${col.materialIds?.length || 0}`);
      for (const m of col.materialIds) {
        if (!m) {
          console.log(`    [!] Missing material reference found!`);
        } else {
          console.log(`    + ${m.title}`);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Check error:", err);
    process.exit(1);
  }
}

check();