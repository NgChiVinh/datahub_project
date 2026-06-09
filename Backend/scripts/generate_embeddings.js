const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const Material = require("../models/Material");
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");
const { extractText } = require("../utils/extractText");
const connectDB = require("../config/db");
require("dotenv").config();

// Cấu hình từ môi trường hoặc mặc định
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 5;
const DELAY_BETWEEN_BATCHES = parseInt(process.env.DELAY) || 2000;
const PROCESS_ALL = process.env.ALL === "1" || process.env.ALL === "true";
const LIMIT = parseInt(process.env.LIMIT) || 0; // 0 = không giới hạn
// CONTENT_ONLY: chỉ trích + lưu contentText, không gọi embedding API.
const CONTENT_ONLY =
  process.env.CONTENT_ONLY === "1" || process.env.CONTENT_ONLY === "true";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchBuffer = (url) =>
  new Promise((resolve) => {
    if (!url || !/^https?:\/\//.test(url)) return resolve(null);
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(30000, () => {
      req.destroy();
      resolve(null);
    });
  });


const migrateEmbeddings = async () => {
  try {
    await connectDB();

    let filter;
    if (CONTENT_ONLY) {
      // Chỉ tài liệu pdf/docx/pptx upload chưa có contentText
      filter = {
        sourceType: "upload",
        materialType: { $in: ["pdf", "docx", "pptx"] },
        $or: [{ contentText: { $exists: false } }, { contentText: "" }],
      };
    } else if (PROCESS_ALL) {
      filter = {};
    } else {
      filter = {
        $or: [
          { embedding: { $exists: false } },
          { embedding: { $size: 0 } },
          { embedding: null },
        ],
      };
    }

    // TYPE=pptx (hoặc pdf,docx) -> giới hạn re-embed theo loại, tránh làm lại tất cả.
    if (process.env.TYPE) {
      filter.materialType = { $in: process.env.TYPE.split(",") };
    }

    let query = Material.find(filter).select("+contentText");
    if (LIMIT > 0) query = query.limit(LIMIT);

    const materials = await query;
    const total = materials.length;

    console.log("\n--- AI REPAIR & GENERATION TOOL ---");
    console.log(
      `Chế độ:     ${CONTENT_ONLY ? "CONTENT_ONLY (không gọi Gemini)" : PROCESS_ALL ? "RE-EMBED ALL" : "ONLY MISSING"}`,
    );
    console.log(`Giới hạn:   ${LIMIT > 0 ? LIMIT : "Không"}`);
    console.log(`Tìm thấy:   ${total} tài liệu cần xử lý.`);
    console.log("-----------------------------------\n");

    if (total === 0) {
      console.log("✅ Không có tài liệu nào cần xử lý.");
      process.exit(0);
    }

    let success = 0;
    let withContent = 0;
    let fail = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = materials.slice(i, i + BATCH_SIZE);
      const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(total / BATCH_SIZE);

      console.log(`[Batch ${currentBatchNum}/${totalBatches}] Đang xử lý ${batch.length} mục...`);

      await Promise.all(
        batch.map(async (m) => {
          try {
            let content = "";
            // Chỉ trích nội dung với tài liệu upload dạng pdf/docx/pptx
            if (
              m.sourceType === "upload" &&
              ["pdf", "docx", "pptx"].includes(m.materialType) &&
              m.fileUrl
            ) {
              const buf = await fetchBuffer(m.fileUrl);
              if (buf) {
                const fname = m.fileUrl.split("/").pop();
                content = await extractText(buf, fname);
                if (content) withContent++;
              }
            }

            // CONTENT_ONLY: chỉ điền contentText (không gọi Gemini, không tốn quota).
            // Dùng để bổ sung contentText cho tài liệu đã embedding từ trước.
            if (CONTENT_ONLY) {
              if (content) {
                m.contentText = content;
                await m.save();
                success++;
                withContent++;
                process.stdout.write("C");
              } else {
                process.stdout.write("-"); // không trích được nội dung
              }
              return;
            }

            const vector = await generateEmbedding(
              buildEmbeddingText(m.title, m.description, content),
            );

            if (vector && vector.length > 0) {
              m.embedding = vector;
              if (content) m.contentText = content;
              await m.save();
              success++;
              // Log tiến độ nhẹ nhàng
              process.stdout.write(content ? "C" : ".");
            } else {
              console.error(`\n❌ Vector rỗng cho: "${m.title}"`);
              fail++;
            }
          } catch (err) {
            console.error(`\n❌ Lỗi "${m.title}":`, err.message);
            fail++;
          }
        }),
      );

      console.log(`\nHoàn thành batch ${currentBatchNum}.`);

      if (i + BATCH_SIZE < total) {
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log("\n===============================");
    console.log("KẾT QUẢ CUỐI CÙNG:");
    console.log(`- Tổng xử lý:       ${total}`);
    console.log(`- Thành công:       ${success} ✅`);
    console.log(`- Có nội dung file: ${withContent} 📄`);
    console.log(`- Thất bại:         ${fail} ❌`);
    console.log("===============================\n");

    process.exit(0);
  } catch (error) {
    console.error("💥 LỖI NGHIÊM TRỌNG:", error);
    process.exit(1);
  }
};

migrateEmbeddings();
