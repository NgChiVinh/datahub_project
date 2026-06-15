const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  const doc = await Material.findById("6a28fad54f3b295b1c7d1145");
  if (!doc) { console.log("Không tìm thấy doc"); process.exit(0); }
  console.log("title:", doc.title);
  console.log("materialType:", doc.materialType);
  console.log("sourceType:", doc.sourceType);
  console.log("fileUrl:", doc.fileUrl);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
