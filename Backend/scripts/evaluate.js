// evaluate.js — Đánh giá định lượng: so sánh truy hồi bằng embedding BASELINE
// (chỉ tiêu đề+mô tả) vs embedding ĐẦY ĐỦ (gồm nội dung file).
// Cùng kho, cùng truy vấn, cùng cách rank (cosine). Đo Precision@5, Recall@5, MRR.
//
// Ground-truth: mỗi truy vấn liệt kê các "mẫu khớp" trong tiêu đề tài liệu liên quan
// (so khớp substring không dấu, không phân biệt hoa thường). Cách này minh bạch,
// kiểm chứng được, phù hợp cho phần đánh giá của khóa luận.
const mongoose = require("mongoose");
const Material = require("../models/Material");
const { generateEmbedding } = require("../services/geminiService");
const connectDB = require("../config/db");
require("dotenv").config();

const K = 5;
const DELAY = parseInt(process.env.DELAY) || 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

// Bộ truy vấn + ground-truth (mẫu khớp trong tiêu đề tài liệu liên quan).
// Nhóm "content": từ khóa chủ yếu nằm trong NỘI DUNG file (kỳ vọng hệ đầy đủ thắng).
// Nhóm "topic": chủ đề chung.
const QUERIES = [
  // --- content-driven ---
  { q: "nodejs express server", rel: ["nodejs", "expressjs"], group: "content" },
  { q: "react component frontend", rel: ["reactjs"], group: "content" },
  { q: "kết nối cơ sở dữ liệu mongodb", rel: ["database", "shopping online"], group: "content" },
  { q: "lập trình hướng đối tượng kế thừa đa hình", rel: ["kế thừa", "đa hình", "lớp và đối tượng"], group: "content" },
  { q: "window form winform giao diện", rel: ["window form"], group: "content" },
  { q: "ma trận định thức", rel: ["ma trận định thức"], group: "content" },
  { q: "không gian vector ánh xạ tuyến tính", rel: ["không gian vecto", "ánh xạ tuyến tính"], group: "content" },
  { q: "hệ phương trình tuyến tính", rel: ["hệ phương trình tuyến tính"], group: "content" },
  { q: "kết nối ado.net cơ sở dữ liệu c#", rel: ["ado.net"], group: "content" },
  { q: "câu hỏi mạng máy tính", rel: ["150_cau", "cau_hoan_chinh"], group: "content" },
  // --- topic-driven ---
  { q: "lập trình web nâng cao", rel: ["lập trình web", "nodejs", "reactjs", "expressjs", "javascript", "database"], group: "topic" },
  { q: "javascript", rel: ["javascript", "js"], group: "topic" },
  { q: "đại số tuyến tính", rel: ["ma trận", "không gian vecto", "ánh xạ tuyến tính", "hệ phương trình", "chéo hóa"], group: "topic" },
  { q: "shopping online mern", rel: ["shopping online"], group: "topic" },
  { q: "java spring", rel: ["spring mvc"], group: "topic" },
];

// cosine similarity
const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const isRelevant = (doc, rel) => {
  const t = norm(doc.title);
  return rel.some((r) => t.includes(norm(r)));
};

// Rank toàn kho theo embedding chỉ định, trả top-K doc.
const rankBy = (qVec, docs, field) => {
  return docs
    .map((d) => ({ doc: d, score: cosine(qVec, d[field] || []) }))
    .filter((x) => (x.doc[field] || []).length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, K);
};

// Tính metric cho 1 truy vấn trên 1 hệ.
const evalQuery = (top, rel, totalRelevant) => {
  let hit = 0, firstRank = 0;
  top.forEach((x, i) => {
    if (isRelevant(x.doc, rel)) {
      hit++;
      if (firstRank === 0) firstRank = i + 1;
    }
  });
  return {
    precision: hit / K,
    recall: totalRelevant > 0 ? hit / totalRelevant : 0,
    rr: firstRank > 0 ? 1 / firstRank : 0,
  };
};

(async () => {
  await connectDB();
  const docs = await Material.find({ status: "approved" }).select(
    "title embedding +embeddingTitleOnly",
  );
  console.log(`Kho đánh giá: ${docs.length} tài liệu approved\n`);

  const agg = {
    title: { p: 0, r: 0, mrr: 0 },
    full: { p: 0, r: 0, mrr: 0 },
  };
  const byGroup = {};

  const rows = [];
  for (const item of QUERIES) {
    const qVec = await generateEmbedding(item.q);
    await sleep(DELAY);
    if (!qVec || qVec.length === 0) {
      console.log(`(bỏ qua, embed query lỗi) ${item.q}`);
      continue;
    }
    const totalRel = docs.filter((d) => isRelevant(d, item.rel)).length;

    const topTitle = rankBy(qVec, docs, "embeddingTitleOnly");
    const topFull = rankBy(qVec, docs, "embedding");

    const mt = evalQuery(topTitle, item.rel, totalRel);
    const mf = evalQuery(topFull, item.rel, totalRel);

    agg.title.p += mt.precision; agg.title.r += mt.recall; agg.title.mrr += mt.rr;
    agg.full.p += mf.precision; agg.full.r += mf.recall; agg.full.mrr += mf.rr;
    byGroup[item.group] = byGroup[item.group] || { n: 0, tp: 0, fp: 0 };
    byGroup[item.group].n++;
    byGroup[item.group].tp += mt.precision;
    byGroup[item.group].fp += mf.precision;

    rows.push({
      q: item.q, group: item.group, totalRel,
      tP: mt.precision, fP: mf.precision, tRR: mt.rr, fRR: mf.rr,
    });
  }

  const n = rows.length;
  console.log("=== CHI TIẾT TỪNG TRUY VẤN (P@5) ===");
  console.log("| Truy vấn | Nhóm | #liên quan | P@5 Baseline | P@5 +Nội dung |");
  console.log("|---|---|---|---|---|");
  rows.forEach((r) =>
    console.log(`| ${r.q} | ${r.group} | ${r.totalRel} | ${r.tP.toFixed(2)} | ${r.fP.toFixed(2)} |`),
  );

  console.log("\n=== TỔNG HỢP (trung bình trên " + n + " truy vấn) ===");
  console.log("| Chỉ số | Baseline (chỉ tiêu đề) | + Nội dung file |");
  console.log("|---|---|---|");
  console.log(`| Precision@5 | ${(agg.title.p / n).toFixed(3)} | ${(agg.full.p / n).toFixed(3)} |`);
  console.log(`| Recall@5 | ${(agg.title.r / n).toFixed(3)} | ${(agg.full.r / n).toFixed(3)} |`);
  console.log(`| MRR | ${(agg.title.mrr / n).toFixed(3)} | ${(agg.full.mrr / n).toFixed(3)} |`);

  console.log("\n=== P@5 THEO NHÓM ===");
  console.log("| Nhóm | Baseline | + Nội dung |");
  console.log("|---|---|---|");
  Object.entries(byGroup).forEach(([g, v]) =>
    console.log(`| ${g} (${v.n}) | ${(v.tp / v.n).toFixed(3)} | ${(v.fp / v.n).toFixed(3)} |`),
  );

  process.exit(0);
})();
