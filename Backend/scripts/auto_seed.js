const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Material = require("../models/Material");
const Category = require("../models/Category");
const Major = require("../models/Major");
const User = require("../models/User");
const uploadFile = require("../utils/uploadFile");
const { extractText } = require("../utils/extractText");
const { generateMetadata, generateEmbedding } = require("../services/aiService");
require("dotenv").config();

// Cấu hình
const SEED_FOLDER = path.join(__dirname, "../seed_materials");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const autoSeed = async () => {
  try {
    await connectDB();

    // 1. Kiểm tra thư mục nguồn
    if (!fs.existsSync(SEED_FOLDER)) {
      console.log(`📁 Tạo thư mục: ${SEED_FOLDER}`);
      fs.mkdirSync(SEED_FOLDER);
      console.log("ℹ️ Hãy bỏ các file tài liệu vào thư mục trên và chạy lại script.");
      process.exit(0);
    }

    const files = fs.readdirSync(SEED_FOLDER).filter(file => 
      [".pdf", ".docx", ".pptx"].includes(path.extname(file).toLowerCase())
    );

    if (files.length === 0) {
      console.log("❌ Không tìm thấy file tài liệu nào trong thư mục seed_materials.");
      process.exit(0);
    }

    // 2. Lấy dữ liệu danh mục để AI lựa chọn
    console.log("🔍 Đang tải danh mục và chuyên ngành từ DB...");
    const categories = await Category.find({}).lean();
    const majors = await Major.find({}).lean();

    if (categories.length === 0 || majors.length === 0) {
      console.warn("⚠️ Cảnh báo: DB chưa có Category hoặc Major. AI sẽ không thể phân loại chính xác.");
    }

    // 3. Lấy User admin
    const admin = await User.findOne({ role: "admin" }) || await User.findOne();
    if (!admin) {
      console.error("❌ Không tìm thấy User nào trong hệ thống.");
      process.exit(1);
    }

    console.log(`🚀 Bắt đầu Auto-Seed ${files.length} file...`);

    for (const fileName of files) {
      try {
        console.log(`\n--- Xử lý: ${fileName} ---`);
        const filePath = path.join(SEED_FOLDER, fileName);
        const buffer = fs.readFileSync(filePath);
        
        // A. Trích xuất text
        const contentText = await extractText(buffer, fileName);
        
        // B. Nhờ AI đặt tên & Phân loại
        console.log("🧠 AI đang đọc nội dung và phân loại...");
        const meta = await generateMetadata(contentText || fileName, categories, majors);
        console.log(`   > Kết quả: [${meta.title}]`);
        console.log(`   > Phân loại: CategoryID: ${meta.categoryId}, MajorID: ${meta.majorId}`);

        // C. Upload file
        console.log("☁️ Đang upload...");
        const uploadResult = await uploadFile({
          originalname: fileName,
          buffer: buffer,
          mimetype: getMimeType(fileName)
        });

        // D. Tạo Embedding
        const embedding = await generateEmbedding(buildEmbeddingText(meta.title, meta.description, contentText));

        // E. Lưu DB
        const newMaterial = new Material({
          title: meta.title,
          description: meta.description,
          fileUrl: uploadResult.url,
          materialType: path.extname(fileName).slice(1).toLowerCase(),
          sourceType: "upload",
          categoryId: meta.categoryId || categories[0]?._id,
          majorId: meta.majorId || majors[0]?._id,
          uploaderId: admin._id,
          status: "approved",
          contentText: contentText,
          embedding: embedding
        });

        await newMaterial.save();
        console.log("✅ Thành công!");

        // Dọn dẹp
        const doneFolder = path.join(SEED_FOLDER, "done");
        if (!fs.existsSync(doneFolder)) fs.mkdirSync(doneFolder);
        fs.renameSync(filePath, path.join(doneFolder, fileName));

        await sleep(1500);
      } catch (err) {
        console.error(`❌ Lỗi file ${fileName}:`, err.message);
      }
    }

    console.log("\n🎉 HOÀN THÀNH!");
    process.exit(0);

  } catch (error) {
    console.error("💥 LỖI:", error);
    process.exit(1);
  }
};

const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
};

autoSeed();
