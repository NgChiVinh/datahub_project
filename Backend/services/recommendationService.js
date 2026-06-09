const Material = require("../models/Material");
const Interaction = require("../models/Interaction");
const { generateEmbedding, expandQuery } = require("./aiService");

// Lọc kết quả tìm kiếm ngữ nghĩa theo kiểu hybrid (vector + từ khóa):
// - Điểm vector >= STRONG  -> chắc chắn liên quan, giữ luôn.
// - Điểm trong [FLOOR, STRONG) -> chỉ giữ nếu có ít nhất 1 từ trong truy vấn
//   trùng với tiêu đề/mô tả tài liệu (chặn chuỗi rác lỡ rơi vào vùng này).
// Đo thực tế: truy vấn thật rõ ~0.85+, truy vấn thật yếu/1 từ ~0.82-0.85,
// rác/lạc đề ~0.80-0.82 và không có từ nào trùng.
const SCORE_STRONG = 0.85;
const SCORE_FLOOR = 0.82;
// Giữ tương thích cho findSimilarMaterials (chỉ dùng 1 ngưỡng sàn).
const SCORE_THRESHOLD = SCORE_FLOOR;

// Tách truy vấn thành các từ đã chuẩn hóa (bỏ dấu, viết thường, độ dài >= 2).
const tokenizeQuery = (text) =>
  (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu tiếng Việt để so khớp linh hoạt
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);

// Kiểm tra tài liệu có chứa ít nhất 1 từ của truy vấn trong tiêu đề/mô tả/nội dung không.
// Bao gồm contentText (nội dung trích từ file) để giữ được truy vấn theo nội dung file
// (vd "nodemailer" chỉ có trong nội dung PDF, không có ở tiêu đề).
const hasKeywordOverlap = (queryWords, doc) => {
  if (queryWords.length === 0) return false;
  const haystack = (
    (doc.title || "") +
    " " +
    (doc.description || "") +
    " " +
    (doc.contentText || "")
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return queryWords.some((w) => haystack.includes(w));
};

/**
 * Tìm tài liệu tương tự dựa trên materialId
 */
const findSimilarMaterials = async (materialId, limit = 5) => {
  try {
    const material = await Material.findById(materialId);
    if (!material || !material.embedding || material.embedding.length === 0) {
      return [];
    }

    const results = await Material.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: material.embedding,
          numCandidates: 100,
          limit: limit + 1, // +1 vì có thể bao gồm chính nó
        },
      },
      {
        $addFields: { score: { $meta: "vectorSearchScore" } },
      },
      {
        $match: {
          _id: { $ne: material._id }, // Loại bỏ chính tài liệu đang xem
          status: "approved", // Chỉ lấy tài liệu đã duyệt
          score: { $gte: SCORE_THRESHOLD },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          materialType: 1,
          fileUrl: 1,
          thumbnail: 1,
          score: 1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    return results;
  } catch (error) {
    console.error("Error in findSimilarMaterials:", error);
    throw error;
  }
};

/**
 * Tìm kiếm ngữ nghĩa dựa trên câu truy vấn
 */
const semanticSearch = async (query, limit = 10) => {
  try {
    const expandedQuery = await expandQuery(query);
    const queryVector = await generateEmbedding(expandedQuery);
    if (!queryVector || queryVector.length === 0) {
      return [];
    }

    const results = await Material.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: limit,
        },
      },
      {
        $addFields: { score: { $meta: "vectorSearchScore" } },
      },
      {
        $match: {
          status: "approved",
          score: { $gte: SCORE_THRESHOLD },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "uploaderId",
          foreignField: "_id",
          as: "uploaderId",
        },
      },
      {
        $unwind: { path: "$uploaderId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          description: 1,
          materialType: 1,
          academicYear: 1,
          createdAt: 1,
          metrics: 1,
          contentText: 1, // chỉ dùng cho hybrid filter, sẽ loại trước khi trả về
          "uploaderId._id": 1,
          "uploaderId.fullName": 1,
          "uploaderId.avatar": 1,
          "categoryId._id": 1,
          "categoryId.name": 1,
          score: 1,
        },
      },
    ]);

    // Lọc hybrid: điểm cao rõ thì giữ; vùng xám thì cần trùng từ khóa (kể cả nội dung file).
    const queryWords = tokenizeQuery(query);
    const filtered = results
      .filter(
        (doc) =>
          doc.score >= SCORE_STRONG ||
          (doc.score >= SCORE_FLOOR && hasKeywordOverlap(queryWords, doc)),
      )
      .slice(0, limit)
      .map(({ contentText, ...rest }) => rest); // không gửi contentText về client

    return filtered;
  } catch (error) {
    console.error("Error in semanticSearch:", error);
    throw error;
  }
};

/**
 * Các stage lookup + project dùng chung để thẻ tài liệu có đủ dữ liệu hiển thị
 */
const cardEnrichStages = [
  {
    $lookup: {
      from: "users",
      localField: "uploaderId",
      foreignField: "_id",
      as: "uploaderId",
    },
  },
  { $unwind: { path: "$uploaderId", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "categoryId",
    },
  },
  { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },
];

const cardProjectFields = {
  title: 1,
  materialType: 1,
  academicYear: 1,
  createdAt: 1,
  metrics: 1,
  "uploaderId._id": 1,
  "uploaderId.fullName": 1,
  "uploaderId.avatar": 1,
  "categoryId._id": 1,
  "categoryId.name": 1,
};

/**
 * Gợi ý tài liệu cá nhân hóa dựa trên lịch sử tương tác của người dùng.
 * Tính vector sở thích = trung bình có trọng số embedding các tài liệu đã tương tác,
 * rồi dùng vector đó để $vectorSearch. User chưa có lịch sử -> cold-start (tài liệu phổ biến).
 */
const getPersonalizedRecommendations = async (userId, limit = 8) => {
  // Lấy tối đa 20 tương tác gần nhất (theo updatedAt vì interaction dùng upsert),
  // kèm embedding của tài liệu tương ứng
  const interactions = await Interaction.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(20)
    .populate({
      path: "materialId",
      select: "title embedding status",
    });

  const valid = interactions.filter(
    (it) =>
      it.materialId &&
      it.materialId.status === "approved" &&
      Array.isArray(it.materialId.embedding) &&
      it.materialId.embedding.length > 0,
  );

  // Cold-start: chưa có lịch sử hợp lệ -> trả tài liệu nhiều lượt xem nhất
  if (valid.length === 0) {
    const popular = await Material.aggregate([
      { $match: { status: "approved" } },
      { $sort: { "metrics.viewCount": -1, createdAt: -1 } },
      { $limit: limit },
      ...cardEnrichStages,
      { $project: cardProjectFields },
    ]);
    return { isColdStart: true, basedOn: null, data: popular };
  }

  // Tính vector sở thích = Σ(embedding × weight) / Σweight
  const dim = valid[0].materialId.embedding.length;
  const profile = new Array(dim).fill(0);
  let totalWeight = 0;
  let strongest = { weight: -1, title: null };
  const interactedIds = [];

  for (const it of valid) {
    const emb = it.materialId.embedding;
    if (emb.length !== dim) continue; // bỏ qua embedding lệch chiều để tránh NaN
    const w = it.weight || 1;
    for (let i = 0; i < dim; i++) profile[i] += emb[i] * w;
    totalWeight += w;
    interactedIds.push(it.materialId._id);
    if (w > strongest.weight) {
      strongest = { weight: w, title: it.materialId.title };
    }
  }

  // Toàn bộ embedding lệch chiều (hiếm) -> coi như cold-start
  if (totalWeight === 0) {
    const popular = await Material.aggregate([
      { $match: { status: "approved" } },
      { $sort: { "metrics.viewCount": -1, createdAt: -1 } },
      { $limit: limit },
      ...cardEnrichStages,
      { $project: cardProjectFields },
    ]);
    return { isColdStart: true, basedOn: null, data: popular };
  }

  for (let i = 0; i < dim; i++) profile[i] /= totalWeight;

  const results = await Material.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: profile,
        numCandidates: 100,
        limit: limit + interactedIds.length,
      },
    },
    {
      $match: {
        status: "approved",
        _id: { $nin: interactedIds },
      },
    },
    ...cardEnrichStages,
    {
      $project: {
        ...cardProjectFields,
        score: { $meta: "vectorSearchScore" },
      },
    },
    { $limit: limit },
  ]);

  return {
    isColdStart: false,
    basedOn: strongest.title,
    data: results,
  };
};

module.exports = {
  findSimilarMaterials,
  semanticSearch,
  getPersonalizedRecommendations,
};
