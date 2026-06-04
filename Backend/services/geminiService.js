const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Tạo tiêu đề, mô tả và phân loại tài liệu dựa trên nội dung
 */
const generateMetadata = async (contentText, categories = [], majors = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const categoriesList = categories.map(c => `- ${c.name} (ID: ${c._id})`).join("\n");
    const majorsList = majors.map(m => `- ${m.name} (ID: ${m._id})`).join("\n");

    const prompt = `
      Dựa trên nội dung trích xuất từ một tài liệu học tập dưới đây, hãy:
      1. Tạo một tiêu đề ngắn gọn, chuyên nghiệp.
      2. Viết một đoạn mô tả tóm tắt hấp dẫn.
      3. Phân loại tài liệu bằng cách chọn 1 Danh mục và 1 Chuyên ngành phù hợp nhất từ danh sách bên dưới.

      DANH SÁCH DANH MỤC:
      ${categoriesList}

      DANH SÁCH CHUYÊN NGÀNH:
      ${majorsList}
      
      Trả về kết quả dưới dạng JSON:
      {
        "title": "Tiêu đề",
        "description": "Mô tả",
        "categoryId": "ID của danh mục đã chọn",
        "majorId": "ID của chuyên ngành đã chọn"
      }
      
      Lưu ý: Chỉ trả về duy nhất chuỗi JSON. Nếu không tìm thấy cái nào phù hợp, hãy chọn cái gần nhất hoặc để null.
      
      Nội dung tài liệu:
      ${contentText.slice(0, 3000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Tài liệu chưa đặt tên", description: "Chưa có mô tả", categoryId: null, majorId: null };
  }
};

const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
};

module.exports = {
  generateEmbedding,
  generateMetadata,
};
