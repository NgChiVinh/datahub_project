const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


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

  const doc = await Material.findById(materialId).select("contentText");
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Bạn là trợ lý học tập. Dựa vào nội dung tài liệu dưới đây, hãy trả lời câu hỏi một cách chính xác và súc tích bằng tiếng Việt. Nếu thông tin không có trong tài liệu, hãy nói rõ là không tìm thấy trong tài liệu.",
      },
      {
        role: "user",
        content: `Nội dung tài liệu:\n${doc.contentText}\n\nCâu hỏi: ${question}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return { answer: response.choices[0].message.content.trim() };
};

const generateQuiz = async (materialId) => {
  const Material = require("../models/Material");

  const doc = await Material.findById(materialId).select("contentText");
  if (!doc) {
    const err = new Error("Tài liệu không tồn tại");
    err.statusCode = 404;
    throw err;
  }
  if (!doc.contentText || doc.contentText.trim().length === 0) {
    const err = new Error("Tài liệu này chưa hỗ trợ quiz");
    err.statusCode = 400;
    throw err;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Dựa vào nội dung tài liệu dưới đây, hãy tạo đúng 5 câu hỏi trắc nghiệm để kiểm tra hiểu biết.

Yêu cầu:
- Mỗi câu có đúng 4 đáp án
- Chỉ 1 đáp án đúng
- Câu hỏi phải dựa trực tiếp vào nội dung, không bịa
- Đáp án nhiễu phải hợp lý, không quá dễ đoán
- Ngôn ngữ: tiếng Việt

Trả về JSON với format sau (không giải thích thêm):
{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0}]}

"answer" là index (0-3) của đáp án đúng trong mảng options.

Nội dung tài liệu:
${doc.contentText}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
    temperature: 0.5,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    const err = new Error("Không thể tạo quiz từ tài liệu này");
    err.statusCode = 400;
    throw err;
  }
  return parsed.questions;
};

module.exports = { generateEmbedding, generateMetadata, expandQuery, buildEmbeddingText, chatWithDocument, generateQuiz };
