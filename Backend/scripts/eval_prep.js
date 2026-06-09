// eval_prep.js — sinh embedding BASELINE chỉ từ tiêu đề + mô tả (embeddingTitleOnly),
// để so sánh với embedding hiện tại (đã gồm nội dung file). Chỉ xử lý tài liệu approved.
// Chạy chậm để tránh rate limit Gemini.
const mongoose = require("mongoose");
const Material = require("../models/Material");
const { generateEmbedding } = require("../services/aiService");
const connectDB = require("../config/db");
require("dotenv").config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 3;
const DELAY = parseInt(process.env.DELAY) || 6000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const buildTitleOnly = (title, description) =>
  "Tiêu đề: " + (title || "") + ". Mô tả: " + (description || "");

(async () => {
  await connectDB();

  // Chỉ cần baseline cho tài liệu approved chưa có embeddingTitleOnly.
  const docs = await Material.find({ status: "approved" }).select(
    "+embeddingTitleOnly title description",
  );
  const todo = docs.filter(
    (m) => !Array.isArray(m.embeddingTitleOnly) || m.embeddingTitleOnly.length === 0,
  );

  console.log(`Approved: ${docs.length}, cần sinh baseline: ${todo.length}`);
  if (todo.length === 0) {
    console.log("Đã đủ baseline.");
    process.exit(0);
  }

  let ok = 0,
    fail = 0;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    console.log(
      `[${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(todo.length / BATCH_SIZE)}]`,
    );
    await Promise.all(
      batch.map(async (m) => {
        try {
          const v = await generateEmbedding(
            buildTitleOnly(m.title, m.description),
          );
          if (v && v.length > 0) {
            m.embeddingTitleOnly = v;
            await m.save();
            ok++;
            process.stdout.write(".");
          } else {
            fail++;
          }
        } catch (e) {
          console.error("\nLỗi:", m.title, e.message);
          fail++;
        }
      }),
    );
    if (i + BATCH_SIZE < todo.length) await sleep(DELAY);
  }

  console.log(`\nXong. OK=${ok} FAIL=${fail}`);
  process.exit(0);
})();
