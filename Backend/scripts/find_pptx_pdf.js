const connectDB = require("../config/db");
const Material = require("../models/Material");
require("dotenv").config();

connectDB().then(async () => {
  // Tìm tất cả doc materialType="pdf" mà URL sẽ trigger isOfficeFile trong viewer
  const pdfDocs = await Material.find(
    { materialType: "pdf" },
    { title: 1, fileUrl: 1, materialType: 1, _id: 1 }
  );

  const officeRegex = /\.(docx|doc|pptx|ppt)$/i;
  const mismatched = pdfDocs.filter(d => officeRegex.test((d.fileUrl || "").split("?")[0]));

  console.log(`\nDocs materialType=pdf nhưng URL là office file: ${mismatched.length}`);
  mismatched.forEach(d => {
    console.log(`  [${d._id}] ${d.materialType} | ${d.title}`);
    console.log(`  URL: ${d.fileUrl}\n`);
  });

  // Cũng tìm pptx docs
  const pptxDocs = await Material.find(
    { materialType: "pptx" },
    { title: 1, fileUrl: 1, materialType: 1, _id: 1 }
  );
  const pdfUrlPptx = pptxDocs.filter(d => /\.pdf$/i.test((d.fileUrl || "").split("?")[0]));
  console.log(`\nDocs materialType=pptx nhưng URL là .pdf: ${pdfUrlPptx.length}`);
  pdfUrlPptx.forEach(d => console.log(`  ${d.title} | ${d.fileUrl?.slice(-50)}`));

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
