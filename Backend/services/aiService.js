const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chunkText = (text, chunkSize = 400, overlap = 50) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks.filter((c) => c.trim().length > 0);
};

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Cache chunk embeddings theo materialId để tránh re-embed khi cùng tài liệu được hỏi nhiều lần.
// Mất khi server restart — đây là behavior đúng vì contentText có thể thay đổi.
const chunkCache = new Map();

// Dựng text để embed: lặp title 2x để tăng trọng số,
// chỉ lấy 1500 chars đầu content (phần intro đại diện nhất).
const buildEmbeddingText = (title, description, content) => {
  const t = title || "";
  const d = description || "";
  const header = `${t}\n${t}\n${d}`;
  if (!content) return header;
  return `${header}\n${content.slice(0, 1500)}`;
};

const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return [];
  }
};

const generateMetadata = async (contentText, categories = [], majors = []) => {
  try {
    const categoriesList = categories
      .map((c) => `- ${c.name} (ID: ${c._id})`)
      .join("\n");
    const majorsList = majors
      .map((m) => `- ${m.name} (ID: ${m._id})`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Dựa trên nội dung tài liệu học tập dưới đây, hãy:
1. Tạo tiêu đề ngắn gọn, chuyên nghiệp.
2. Viết mô tả tóm tắt hấp dẫn.
3. Chọn 1 Danh mục và 1 Chuyên ngành phù hợp nhất.

DANH SÁCH DANH MỤC:
${categoriesList}

DANH SÁCH CHUYÊN NGÀNH:
${majorsList}

Trả về JSON: {"title":"...","description":"...","categoryId":"...","majorId":"..."}
Chỉ trả về duy nhất chuỗi JSON.

Nội dung: ${contentText.slice(0, 3000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating metadata:", error.message);
    return {
      title: "Tài liệu chưa đặt tên",
      description: "Chưa có mô tả",
      categoryId: null,
      majorId: null,
    };
  }
};

// Mở rộng query trước khi embed để cải thiện recall.
// Fallback về query gốc nếu API lỗi — không bao giờ block luồng search.
const expandQuery = async (query) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Mở rộng từ khóa tìm kiếm sau thành các từ liên quan (tối đa 20 từ, cách nhau bằng dấu cách, không giải thích, không xuống dòng):
"${query}"`,
        },
      ],
      max_tokens: 60,
    });
    const expanded = response.choices[0].message.content.trim();
    return expanded || query;
  } catch (error) {
    console.error("Error expanding query, using original:", error.message);
    return query;
  }
};

const chatWithDocument = async (materialId, question) => {
  const Material = require("../models/Material");

  const doc = await Material.findById(materialId).select("contentText title");
  if (!doc) {
    const err = new Error("Tài liệu không tồn tại");
    err.statusCode = 404;
    throw err;
  }
  if (!doc.contentText || doc.contentText.trim().length === 0) {
    const err = new Error("Tài liệu này chưa hỗ trợ chat");
    err.statusCode = 400;
    throw err;
  }

  const cacheKey = materialId.toString();
  if (!chunkCache.has(cacheKey)) {
    const chunks = chunkText(doc.contentText);
    const vectors = await Promise.all(chunks.map((chunk) => generateEmbedding(chunk)));
    chunkCache.set(
      cacheKey,
      chunks.map((chunk, i) => ({ chunk, vector: vectors[i] }))
    );
  }
  const cached = chunkCache.get(cacheKey);

  const questionVector = await generateEmbedding(question);

  const top4 = cached
    .map(({ chunk, vector }) => ({ chunk, score: cosineSimilarity(questionVector, vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const contextText = top4.map((s) => s.chunk).join("\n---\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Bạn là trợ lý học tập. Dựa vào các đoạn trích dưới đây từ tài liệu, hãy trả lời câu hỏi một cách chính xác và súc tích bằng tiếng Việt. Nếu thông tin không có trong các đoạn trích, hãy nói rõ là không tìm thấy trong tài liệu.",
      },
      {
        role: "user",
        content: `Context:\n${contextText}\n\nCâu hỏi: ${question}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return { answer: response.choices[0].message.content.trim() };
};

module.exports = { generateEmbedding, generateMetadata, expandQuery, buildEmbeddingText, chatWithDocument };
