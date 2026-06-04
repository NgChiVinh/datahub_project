const mongoose = require('mongoose');
require('dotenv').config();
const { semanticSearch, findSimilarMaterials } = require('./services/recommendationService');
const Material = require('./models/Material');

async function testRecommendation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- TEST SEMANTIC SEARCH ---');
    const query = "Lập trình web với Nodejs và React";
    console.log(`Query: "${query}"`);
    
    const searchResults = await semanticSearch(query, 3);
    console.log(`Found ${searchResults.length} results.`);
    searchResults.forEach((item, i) => {
      console.log(`${i+1}. ${item.title} (Score: ${item.score.toFixed(4)})`);
    });

    console.log('\n--- TEST SIMILAR MATERIALS ---');
    // Lấy đại 1 tài liệu có embedding
    const doc = await Material.findOne({ "embedding.0": { $exists: true }, status: "approved" });
    if (doc) {
      console.log(`Target: "${doc.title}"`);
      const similarResults = await findSimilarMaterials(doc._id, 3);
      console.log(`Found ${similarResults.length} similar materials.`);
      similarResults.forEach((item, i) => {
        console.log(`${i+1}. ${item.title} (Score: ${item.score.toFixed(4)})`);
      });
    } else {
      console.log('No approved material with embedding found for similarity test.');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    process.exit();
  }
}

testRecommendation();
