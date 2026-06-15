const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  const docs = await Material.find(
    { title: { $regex: "xac suat|xác suất|XSTK|thong ke|thống kê", $options: "i" } },
    { title: 1, fileUrl: 1, materialType: 1 }
  );

  docs.forEach(d => {
    const urlTail = (d.fileUrl || "").slice(-60);
    console.log(`[${d.materialType}] ${d.title}`);
    console.log(`  URL: ...${urlTail}\n`);
  });

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
