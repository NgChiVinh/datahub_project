const recommendationService = require("../services/recommendationService");
const { chatWithDocument, generateQuiz } = require("../services/aiService");
const mongoose = require("mongoose");

// Lấy tài liệu tương tự
exports.getSimilarMaterials = async (req, res) => {
  try {
    const { materialId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const materials = await recommendationService.findSimilarMaterials(materialId, limit);
    
    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tài liệu tương tự",
      error: error.message,
    });
  }
};

// Tìm kiếm ngữ nghĩa
exports.searchSemantic = async (req, res) => {
  try {
    const { q, type } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp từ khóa tìm kiếm (q)",
      });
    }

    const materials = await recommendationService.semanticSearch(q, limit, type);

    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm ngữ nghĩa",
      error: error.message,
    });
  }
};

// Gợi ý cá nhân hóa cho người dùng đang đăng nhập
exports.getForYou = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const result = await recommendationService.getPersonalizedRecommendations(
      req.user._id,
      limit,
    );

    res.json({
      success: true,
      isColdStart: result.isColdStart,
      basedOn: result.basedOn,
      count: result.data.length,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy gợi ý cá nhân hóa",
      error: error.message,
    });
  }
};

// Hỏi AI về nội dung của một tài liệu cụ thể (RAG)
exports.chatDocument = async (req, res) => {
  try {
    const { materialId, question } = req.body;

    if (!materialId || !question?.trim()) {
      return res.status(400).json({ success: false, message: "Thiếu materialId hoặc question" });
    }
    if (question.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Câu hỏi quá dài (tối đa 1000 ký tự)" });
    }
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ success: false, message: "materialId không hợp lệ" });
    }

    const result = await chatWithDocument(materialId, question.trim());
    res.json({ success: true, answer: result.answer });
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 500 ? "AI đang bận, vui lòng thử lại sau" : error.message;
    res.status(status).json({ success: false, message });
  }
};

// Tạo quiz tự động từ nội dung tài liệu
exports.quizDocument = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({ success: false, message: "Thiếu materialId" });
    }
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ success: false, message: "materialId không hợp lệ" });
    }

    const questions = await generateQuiz(materialId);
    res.json({ success: true, questions });
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 500 ? "AI đang bận, vui lòng thử lại sau" : error.message;
    res.status(status).json({ success: false, message });
  }
};
