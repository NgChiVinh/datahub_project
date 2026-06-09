const assert = require("assert");
const { buildEmbeddingText, generateEmbedding, expandQuery } = require("../services/aiService");
require("dotenv").config();

async function run() {
  // Test 1: buildEmbeddingText repeats title
  const text = buildEmbeddingText("React Hooks", "Hướng dẫn React", "useState useEffect");
  assert(text.startsWith("React Hooks\nReact Hooks"), "title phải lặp 2 lần");
  assert(text.includes("useState"), "content phải có mặt");
  console.log("✓ buildEmbeddingText đúng format");

  // Test 2: không có content
  const noContent = buildEmbeddingText("Title", "Desc", "");
  assert(noContent === "Title\nTitle\nDesc", "không content thì chỉ header");
  console.log("✓ buildEmbeddingText không content: OK");

  // Test 3: content bị cắt tại 1500 chars
  const longContent = "x".repeat(3000);
  const trimmed = buildEmbeddingText("T", "D", longContent);
  const contentPart = trimmed.split("\n").slice(3).join("");
  assert(contentPart.length === 1500, `content phải bị cắt ở 1500, nhận ${contentPart.length}`);
  console.log("✓ buildEmbeddingText cắt content tại 1500: OK");

  // Test 4: generateEmbedding trả vector 1536 chiều
  console.log("Đang gọi OpenAI embedding API...");
  const vector = await generateEmbedding("test embedding vector");
  assert(Array.isArray(vector), "kết quả phải là mảng");
  assert(vector.length === 1536, `dims phải là 1536, nhận được ${vector.length}`);
  console.log(`✓ generateEmbedding trả ${vector.length} dims`);

  // Test 5: expandQuery trả chuỗi dài hơn query gốc
  console.log("Đang gọi expandQuery...");
  const expanded = await expandQuery("web");
  assert(typeof expanded === "string" && expanded.length > 0, "expandQuery phải trả chuỗi");
  console.log(`✓ expandQuery("web") → "${expanded}"`);

  console.log("\nTất cả tests PASS ✓");
}

run().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
