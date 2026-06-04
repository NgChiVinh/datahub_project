const recommendationService = require("../services/recommendationService");

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
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp từ khóa tìm kiếm (q)",
      });
    }

    const materials = await recommendationService.semanticSearch(q, limit);

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
