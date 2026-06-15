const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  const allDocs = await Material.find({}, { title: 1, fileUrl: 1, materialType: 1, sourceType: 1 });

  let mismatches = 0;
  for (const d of allDocs) {
    const ext = (d.fileUrl || "").split("?")[0].split(".").pop().toLowerCase();
    const EXT_MAP = { pdf:"pdf", docx:"docx", doc:"docx", pptx:"pptx", ppt:"pptx", zip:"zip", rar:"zip", mp4:"video", mov:"video", mkv:"video", webm:"video" };
    const expected = EXT_MAP[ext];
    if (expected && d.materialType !== expected) {
      console.log(`MISMATCH | DB:${d.materialType} expected:${expected} | ${d.title} | ...${(d.fileUrl||"").slice(-50)}`);
      mismatches++;
    }
  }

  console.log(`\nTotal: ${allDocs.length} docs, ${mismatches} mismatches`);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
