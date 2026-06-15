const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  const total = await Material.countDocuments();
  const byType = await Material.aggregate([{ $group: { _id: "$materialType", count: { $sum: 1 } } }]);
  console.log(`Total: ${total}`);
  byType.forEach(t => console.log(`  ${t._id}: ${t.count}`));

  // Bất kỳ doc nào materialType=pdf nhưng URL có pptx hoặc ngược lại
  const allDocs = await Material.find({}, { title: 1, fileUrl: 1, materialType: 1 });
  const problems = allDocs.filter(d => {
    const url = (d.fileUrl || "").toLowerCase();
    const isPptxUrl = url.includes(".pptx") || url.includes("%2Epptx");
    const isPdfType = d.materialType === "pdf";
    return isPptxUrl && isPdfType;
  });

  console.log(`\nPptx URL nhưng type=pdf: ${problems.length}`);
  problems.forEach(d => console.log(`  [${d._id}] ${d.title}\n  ${d.fileUrl}\n`));

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
