const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  const counts = await Material.aggregate([
    { $group: { _id: "$materialType", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log("\n=== Phân bổ materialType trong DB ===");
  counts.forEach(c => console.log(`  ${c._id}: ${c.count}`));

  // Tìm file nào có .pptx trong URL nhưng KHÔNG phải materialType=pptx
  const pptxUrls = await Material.find(
    { fileUrl: { $regex: "\\.pptx", $options: "i" } },
    { title: 1, fileUrl: 1, materialType: 1 }
  );
  console.log(`\n=== Files có .pptx trong URL: ${pptxUrls.length} ===`);
  pptxUrls.forEach(d => {
    const flag = d.materialType !== "pptx" ? " *** SAI ***" : "";
    console.log(`  [${d.materialType}]${flag} | ...${d.fileUrl.slice(-50)} | ${d.title?.slice(0, 40)}`);
  });

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
