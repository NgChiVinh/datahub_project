const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

const EXT_TO_TYPE = {
  pdf: "pdf",
  docx: "docx",
  doc: "docx",
  odt: "docx",
  txt: "docx",
  pptx: "pptx",
  ppt: "pptx",
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  tar: "zip",
  gz: "zip",
  mp4: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  webm: "video",
  flv: "video",
  wmv: "video",
};

const getTypeFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  return EXT_TO_TYPE[ext] || null;
};

const run = async () => {
  await connectDB();
  console.log("Kết nối DB thành công\n");

  const docs = await Material.find({ sourceType: "upload" }, { _id: 1, fileUrl: 1, materialType: 1, title: 1 });
  console.log(`Tổng tài liệu upload: ${docs.length}`);

  let fixed = 0;
  let skipped = 0;

  for (const doc of docs) {
    const correctType = getTypeFromUrl(doc.fileUrl);

    if (!correctType) {
      console.log(`  [SKIP] ${doc.title} — không detect được ext từ URL`);
      skipped++;
      continue;
    }

    if (doc.materialType === correctType) {
      skipped++;
      continue;
    }

    console.log(`  [FIX] "${doc.title}": ${doc.materialType} → ${correctType} (${doc.fileUrl.split("/").pop()})`);
    await Material.updateOne({ _id: doc._id }, { $set: { materialType: correctType } });
    fixed++;
  }

  console.log(`\nHoàn tất: fixed=${fixed}, skipped=${skipped}`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
