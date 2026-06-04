// evaluate_content.js — Đánh giá CONTENT-SPECIFIC: dùng các truy vấn mà từ khóa
// CHỈ xuất hiện trong NỘI DUNG file, KHÔNG có trong tiêu đề. Ground-truth được xác
// định ĐỘC LẬP bằng cách dò chính nội dung đã trích (contentText) — không thiên vị
// hệ nào. Đây là phép đo công bằng để thấy lợi ích của embedding nội dung.
const mongoose = require("mongoose");
const Material = require("../models/Material");
const { generateEmbedding } = require("../services/geminiService");
const connectDB = require("../config/db");
require("dotenv").config();

const K = 5;
const DELAY = parseInt(process.env.DELAY) || 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

// Truy vấn content-specific. "term" = cụm từ định nghĩa ground-truth: tài liệu liên
// quan = tài liệu có term trong NỘI DUNG (xác minh độc lập, không phụ thuộc embedding).
const QUERIES = [
  { q: "gửi email trong nodejs", term: "nodemailer" },
  { q: "cài đặt thư viện bằng trình quản lý gói", term: "npm" },
  { q: "đọc ghi tập tin hệ thống", term: "file system" },
  { q: "truyền dữ liệu giữa các component react", term: "props" },
  { q: "xác thực bằng token", term: "token" },
  { q: "khóa chính trong bảng dữ liệu", term: "primary key" },
  { q: "hàm khởi tạo đối tượng", term: "constructor" },
  { q: "giao diện trừu tượng interface", term: "interface" },
  { q: "tính đa hình trong lập trình", term: "polymorphism" },
  { q: "giao thức truyền tải tcp", term: "tcp" },
  { q: "địa chỉ ip và mạng con", term: "subnet" },
  { q: "tập dữ liệu phân tích", term: "dataset" },
];

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const rankBy = (qVec, docs, field) =>
  docs
    .map((d) => ({ doc: d, score: cosine(qVec, d[field] || []) }))
    .filter((x) => (x.doc[field] || []).length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, K);

(async () => {
  await connectDB();
  const docs = await Material.find({ status: "approved" }).select(
    "title +contentText embedding +embeddingTitleOnly",
  );

  // Ground-truth độc lập: id tài liệu có term trong nội dung.
  const truth = {};
  QUERIES.forEach((item) => {
    const nt = norm(item.term);
    truth[item.q] = new Set(
      docs.filter((d) => d.contentText && norm(d.contentText).includes(nt)).map((d) => d._id.toString()),
    );
  });

  const agg = { title: { p: 0, r: 0, mrr: 0 }, full: { p: 0, r: 0, mrr: 0 } };
  const rows = [];

  for (const item of QUERIES) {
    const rel = truth[item.q];
    const qVec = await generateEmbedding(item.q);
    await sleep(DELAY);
    if (!qVec || qVec.length === 0) continue;

    const evalTop = (top) => {
      let hit = 0, first = 0;
      top.forEach((x, i) => {
        if (rel.has(x.doc._id.toString())) { hit++; if (!first) first = i + 1; }
      });
      return { p: hit / K, r: rel.size ? hit / rel.size : 0, rr: first ? 1 / first : 0 };
    };

    const mt = evalTop(rankBy(qVec, docs, "embeddingTitleOnly"));
    const mf = evalTop(rankBy(qVec, docs, "embedding"));
    agg.title.p += mt.p; agg.title.r += mt.r; agg.title.mrr += mt.rr;
    agg.full.p += mf.p; agg.full.r += mf.r; agg.full.mrr += mf.rr;
    rows.push({ q: item.q, term: item.term, n: rel.size, tP: mt.p, fP: mf.p, tRR: mt.rr, fRR: mf.rr });
  }

  const n = rows.length;
  console.log("=== TRUY VẤN CONTENT-SPECIFIC (từ khóa chỉ có trong nội dung file) ===");
  console.log("| Truy vấn | từ khóa nội dung | #liên quan | P@5 Baseline | P@5 +Nội dung | MRR Base | MRR +ND |");
  console.log("|---|---|---|---|---|---|---|");
  rows.forEach((r) =>
    console.log(`| ${r.q} | ${r.term} | ${r.n} | ${r.tP.toFixed(2)} | ${r.fP.toFixed(2)} | ${r.tRR.toFixed(2)} | ${r.fRR.toFixed(2)} |`),
  );

  console.log("\n=== TỔNG HỢP (trung bình " + n + " truy vấn content-specific) ===");
  console.log("| Chỉ số | Baseline (chỉ tiêu đề) | + Nội dung file | Cải thiện |");
  console.log("|---|---|---|---|");
  const imp = (a, b) => (a === 0 ? (b > 0 ? "+∞" : "0%") : "+" + (((b - a) / a) * 100).toFixed(0) + "%");
  const tp = agg.title.p / n, fp = agg.full.p / n;
  const tr = agg.title.r / n, fr = agg.full.r / n;
  const tm = agg.title.mrr / n, fm = agg.full.mrr / n;
  console.log(`| Precision@5 | ${tp.toFixed(3)} | ${fp.toFixed(3)} | ${imp(tp, fp)} |`);
  console.log(`| Recall@5 | ${tr.toFixed(3)} | ${fr.toFixed(3)} | ${imp(tr, fr)} |`);
  console.log(`| MRR | ${tm.toFixed(3)} | ${fm.toFixed(3)} | ${imp(tm, fm)} |`);

  process.exit(0);
})();
