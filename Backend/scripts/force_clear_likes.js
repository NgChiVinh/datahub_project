const mongoose = require('mongoose');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function clear() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Material.updateMany({}, { $set: { likes: [] } });
    console.log(`Cleared likes from ${result.modifiedCount} materials.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clear();
