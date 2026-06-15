// Trích xuất văn bản thô từ buffer file (PDF, DOCX) để phục vụ tạo embedding.
// Lưu ý: require thẳng lib/pdf-parse.js để tránh lỗi debug-mode của pdf-parse@1.1.1
// (nếu require "pdf-parse" trực tiếp nó sẽ thử đọc 1 file test và crash).
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const mammoth = require("mammoth");
const officeParser = require("officeparser");

// Giới hạn số ký tự đưa vào embedding. OpenAI text-embedding-3-small xử lý tốt
// ~8000 ký tự — đủ đại diện nội dung mà không tốn quá nhiều token.
const MAX_CHARS = 8000;

// Chuẩn hóa khoảng trắng và cắt về giới hạn.
const normalize = (text) =>
  (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);

// Suy ra loại file từ tên file (ưu tiên) hoặc mimetype.
const detectType = (filename, mimetype) => {
  const ext = (filename || "").split(".").pop().toLowerCase();
  if (ext === "pdf" || mimetype === "application/pdf") return "pdf";
  if (
    ext === "docx" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (
    ext === "pptx" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return "pptx";
  return "unsupported";
};

/**
 * Trích text từ buffer. Trả về chuỗi đã chuẩn hóa (rỗng nếu không hỗ trợ/lỗi).
 * Không bao giờ throw — lỗi parse không được làm hỏng luồng upload.
 */
const extractText = async (buffer, filename, mimetype) => {
  if (!buffer || buffer.length === 0) return "";
  const type = detectType(filename, mimetype);

  try {
    if (type === "pdf") {
      const data = await pdfParse(buffer);
      return normalize(data.text);
    }
    if (type === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return normalize(result.value);
    }
    if (type === "pptx") {
      // officeparser đọc text từ buffer pptx (cả docx/xlsx) bằng cách giải nén OOXML.
      const text = await officeParser.parseOfficeAsync(buffer);
      return normalize(text);
    }
    // zip, video, ảnh... -> không trích text, dựa vào tiêu đề + mô tả
    return "";
  } catch (err) {
    console.error(`Lỗi trích text (${type}):`, err.message);
    return "";
  }
};

module.exports = { extractText, MAX_CHARS };
