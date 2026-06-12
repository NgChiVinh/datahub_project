const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Material = require("../models/Material");
const User = require("../models/User");
const uploadFile = require("../utils/uploadFile");
const { extractText } = require("../utils/extractText");
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SEED_FOLDER = path.join(__dirname, "../seed_materials/Tai_Lieu");
const SUPPORTED_EXTS = [".pdf", ".docx", ".pptx"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Map tên folder → { categoryId, majorId, categoryName, majorName }
const FOLDER_MAP = {
  CacCongCuVaNenTangChoTriTueNhanTao: {
    categoryId: "6a0562b8b69eaa8bcc5b26c5",
    majorId: "6a05a50f4da4878c41105184",
    categoryName: "Các công cụ và nền tảng cho trí tuệ nhân tạo",
    majorName: "Trí tuệ Nhân tạo",
  },
  CauTrucDuLieuVaGiaiThuat: {
    categoryId: "6a0562b6b69eaa8bcc5b269c",
    majorId: "6a05a70ae6e3b6a634c31bca",
    categoryName: "Cấu trúc dữ liệu và giải thuật",
    majorName: "Kiến thức cơ sở ngành",
  },
  LyThuyet_NhapMonTriTueNhanTao: {
    categoryId: "6a0562b7b69eaa8bcc5b26bd",
    majorId: "6a05a50f4da4878c41105184",
    categoryName: "Nhập môn Trí tuệ nhân tạo",
    majorName: "Trí tuệ Nhân tạo",
  },
  PhanTichDuLieu: {
    categoryId: "6a0562b7b69eaa8bcc5b26b9",
    majorId: "6a05a50f4da4878c41105185",
    categoryName: "Nhập môn Phân tích Dữ liệu lớn",
    majorName: "Công nghệ dữ liệu",
  },
  SlideBaiGiang_HocMayVaUngDung: {
    categoryId: "6a0562b7b69eaa8bcc5b26c1",
    majorId: "6a05a50f4da4878c41105184",
    categoryName: "Học máy ứng dụng",
    majorName: "Trí tuệ Nhân tạo",
  },
  SlideBaiGiang_Python_NangCao: {
    categoryId: "6a0562b7b69eaa8bcc5b26b3",
    majorId: "6a05a50f4da4878c41105183",
    categoryName: "Lập trình Python nâng cao",
    majorName: "Công nghệ Phần mềm",
  },
  ThucHanh_NhapMonTriTueNhanTao: {
    categoryId: "6a0562b7b69eaa8bcc5b26bd",
    majorId: "6a05a50f4da4878c41105184",
    categoryName: "Nhập môn Trí tuệ nhân tạo",
    majorName: "Trí tuệ Nhân tạo",
  },
  XacSuatThongKeChoKHMT: {
    categoryId: "6a0562b7b69eaa8bcc5b26c0",
    majorId: "6a05a50f4da4878c41105184",
    categoryName: "Xác suất và Thống kê cho Khoa học máy tính",
    majorName: "Trí tuệ Nhân tạo",
  },
};

const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
};

const generateTitleDesc = async (fileName, folderName, contentText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Dựa vào tên file, tên môn học và nội dung tài liệu học tập dưới đây, hãy:
1. Tạo tiêu đề ngắn gọn, chuyên nghiệp bằng tiếng Việt.
2. Viết mô tả tóm tắt 1-2 câu.

Tên môn học: ${folderName.replace(/_/g, " ")}
Tên file: ${fileName}
Nội dung (đầu tài liệu): ${(contentText || "").slice(0, 2000)}

Trả về JSON: {"title":"...","description":"..."}
Chỉ trả về duy nhất chuỗi JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      title: path.basename(fileName, path.extname(fileName)),
      description: `Tài liệu môn ${folderName.replace(/_/g, " ")}`,
    };
  }
};

const autoSeed = async () => {
  try {
    await connectDB();

    if (!fs.existsSync(SEED_FOLDER)) {
      console.log(`❌ Không tìm thấy thư mục: ${SEED_FOLDER}`);
      process.exit(1);
    }

    const admin = await User.findOne({ role: "admin" }) || await User.findOne();
    if (!admin) {
      console.error("❌ Không tìm thấy User nào trong hệ thống.");
      process.exit(1);
    }

    // Thu thập tất cả file từ các subfolder
    const tasks = [];
    const subFolders = fs.readdirSync(SEED_FOLDER).filter((f) =>
      fs.statSync(path.join(SEED_FOLDER, f)).isDirectory()
    );

    for (const folderName of subFolders) {
      const mapping = FOLDER_MAP[folderName];
      if (!mapping) {
        console.warn(`⚠️  Bỏ qua folder không có mapping: ${folderName}`);
        continue;
      }
      const folderPath = path.join(SEED_FOLDER, folderName);
      const files = fs.readdirSync(folderPath).filter((f) =>
        SUPPORTED_EXTS.includes(path.extname(f).toLowerCase())
      );
      const skipped = fs.readdirSync(folderPath).filter((f) =>
        path.extname(f).toLowerCase() === ".ppt"
      );
      if (skipped.length > 0) {
        console.warn(`⚠️  [${folderName}] Bỏ qua ${skipped.length} file .ppt (không hỗ trợ): ${skipped.join(", ")}`);
      }
      for (const fileName of files) {
        tasks.push({ folderName, folderPath, fileName, mapping });
      }
    }

    console.log(`\n🚀 Bắt đầu upload ${tasks.length} file từ ${subFolders.length} folder...\n`);

    let success = 0;
    let failed = 0;

    for (const { folderName, folderPath, fileName, mapping } of tasks) {
      try {
        console.log(`--- [${folderName}] ${fileName} ---`);
        const filePath = path.join(folderPath, fileName);
        const buffer = fs.readFileSync(filePath);

        // Trích text
        const contentText = await extractText(buffer, fileName);

        // AI generate title + description (category/major đã biết từ folder)
        console.log("🧠 AI generate title/description...");
        const meta = await generateTitleDesc(fileName, folderName, contentText);
        console.log(`   > Title: ${meta.title}`);
        console.log(`   > Category: ${mapping.categoryName} | Major: ${mapping.majorName}`);

        // Upload R2
        console.log("☁️  Upload R2...");
        const uploadResult = await uploadFile({
          originalname: fileName,
          buffer,
          mimetype: getMimeType(fileName),
        });

        // Embedding
        const embedding = await generateEmbedding(
          buildEmbeddingText(meta.title, meta.description, contentText)
        );

        // Lưu DB
        await new Material({
          title: meta.title,
          description: meta.description,
          fileUrl: uploadResult.url,
          materialType: path.extname(fileName).slice(1).toLowerCase(),
          sourceType: "upload",
          categoryId: mapping.categoryId,
          majorId: mapping.majorId,
          uploaderId: admin._id,
          status: "approved",
          contentText,
          embedding,
        }).save();

        console.log("✅ Xong!\n");
        success++;
        await sleep(1000);
      } catch (err) {
        console.error(`❌ Lỗi [${folderName}/${fileName}]:`, err.message, "\n");
        failed++;
      }
    }

    console.log(`\n🎉 HOÀN THÀNH! Thành công: ${success} | Lỗi: ${failed}`);
    process.exit(0);
  } catch (error) {
    console.error("💥 LỖI:", error);
    process.exit(1);
  }
};

autoSeed();
