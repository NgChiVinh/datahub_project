const Material = require("../models/Material");
const Tag = require("../models/Tag");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const Interaction = require("../models/Interaction");
const Review = require("../models/Review");
const Comment = require("../models/Comment");
const Report = require("../models/Report");
const StudyCollection = require("../models/StudyCollection");
const SearchLog = require("../models/SearchLog");
const User = require("../models/User");
const slugify = require("slugify");
const mongoose = require("mongoose");
const uploadFile = require("../utils/uploadFile");
const { deleteFile } = require("../utils/uploadFile");
const { extractText } = require("../utils/extractText");
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");

// Sinh embedding an toàn: trả mảng rỗng nếu lỗi (đã log bên trong generateEmbedding).
const safeGenerateEmbedding = async (title, description, content) => {
  try {
    return await generateEmbedding(buildEmbeddingText(title, description, content));
  } catch (aiError) {
    console.error("AI Embedding error:", aiError.message);
    return [];
  }
};

// Ghi lại tương tác của người dùng để phục vụ gợi ý cá nhân hóa.
// Dùng upsert theo (userId, materialId, actionType) để mỗi loại tương tác trên
// một tài liệu chỉ có 1 bản ghi -> tránh 1 tài liệu xem nhiều lần lấn át hồ sơ sở thích.
// timestamps tự cập nhật updatedAt nên lần tương tác mới nhất được ưu tiên về recency.
// Không chặn response chính nếu ghi thất bại.
const recordInteraction = async (userId, materialId, actionType, weight) => {
  if (!userId) return;
  try {
    await Interaction.findOneAndUpdate(
      { userId, materialId, actionType },
      { $set: { weight } },
      { upsert: true, new: true },
    );
  } catch (err) {
    console.error("Lỗi ghi interaction:", err.message);
  }
};

// CREATE (upload file hoặc gửi link + lưu DB)
const createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      materialType,
      categoryId,
      majorId,
      tags,
      link,
      academicYear,
    } = req.body;

    let finalFileUrl = "";
    let finalSourceType = "upload";
    let finalMaterialType = materialType || "other";

    if (req.file) {
      try {
        const uploadResult = await uploadFile(req.file);
        finalFileUrl = uploadResult.url;
        finalSourceType = "upload";
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({
          message: "Lỗi khi tải file lên hệ thống lưu trữ",
          error: uploadError.message,
        });
      }

      if (!materialType || materialType === "other") {
        const ext = req.file.originalname.split(".").pop().toLowerCase();

        if (["pdf"].includes(ext)) finalMaterialType = "pdf";
        else if (["doc", "docx", "odt", "txt"].includes(ext)) finalMaterialType = "docx";
        else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) finalMaterialType = "zip";
        else if (["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) finalMaterialType = "video";
        else if (["ppt", "pptx"].includes(ext)) finalMaterialType = "pptx";
        else finalMaterialType = "other";
      }
    } else if (link) {
      finalFileUrl = link;
      finalSourceType = "link";

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (youtubeRegex.test(link)) {
        finalMaterialType = "video";
      }
    } else {
      return res.status(400).json({
        message: "Vui lòng upload file hoặc cung cấp đường dẫn tài liệu",
      });
    }

    let processedTags = [];

    if (tags) {
      try {
        const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

        if (Array.isArray(parsedTags)) {
          for (const tagInput of parsedTags) {
            if (
              tagInput.length === 24 &&
              /^[0-9a-fA-F]{24}$/.test(tagInput)
            ) {
              processedTags.push(tagInput);
            } else {
              const slug = slugify(tagInput, { lower: true });

              let tag = await Tag.findOne({ slug });

              if (!tag) {
                tag = new Tag({
                  name: tagInput,
                  slug,
                });

                await tag.save();
              }

              processedTags.push(tag._id);
            }
          }
        }
      } catch (e) {
        console.error("Parse tags error:", e.message);
      }
    }

    // AI Embedding Integration: ưu tiên trích nội dung file (PDF/docx) để embedding
    // phản ánh đúng nội dung tài liệu, không chỉ tiêu đề/mô tả.
    let fileContent = "";
    if (req.file && req.file.buffer) {
      fileContent = await extractText(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );
    }

    const vector = await safeGenerateEmbedding(title, description, fileContent);
    if (!vector || vector.length === 0) {
      console.warn(
        `[Embedding] Tài liệu "${title}" được tạo với embedding rỗng — sẽ không xuất hiện trong tìm kiếm AI cho tới khi chạy lại script generate_embeddings.`,
      );
    }

    const material = new Material({
      title,
      description,
      materialType: finalMaterialType,
      sourceType: finalSourceType,
      academicYear: academicYear || "Khác",
      categoryId,
      majorId,
      uploaderId: req.user._id,
      fileUrl: finalFileUrl,
      tags: processedTags,
      status: "pending",
      embedding: vector,
      contentText: fileContent || "",
    });

    const savedMaterial = await material.save();

    return res.status(201).json({
      message: "Chia sẻ tài liệu thành công. Vui lòng đợi phê duyệt.",
      material: savedMaterial,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi upload",
      error: error.message,
    });
  }
};

// Hàm đệ quy lấy tất cả ID của danh mục con, cháu...
const getAllChildCategoryIds = async (parentId) => {
  let childIds = [parentId];

  const children = await Category.find({
    parentId,
  }).select("_id");

  for (const child of children) {
    const grandchildrenIds = await getAllChildCategoryIds(child._id);
    childIds = [...childIds, ...grandchildrenIds];
  }

  return childIds;
};

// GET ALL (Có hỗ trợ lọc phân cấp chuẩn)
const getMaterials = async (req, res) => {
  try {
    const {
      category,
      major,
      academicYear,
      search,
      status,
      uploaderId,
      likedBy,
      sortBy,
      materialType,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (materialType) {
      if (materialType === "not_video") {
        query.materialType = { $ne: "video" };
      } else {
        query.materialType = materialType;
      }
    }

    // 1. Lọc theo người đăng
    if (uploaderId !== undefined) {
      if (
        !uploaderId ||
        uploaderId === "undefined" ||
        uploaderId === "null" ||
        uploaderId === ""
      ) {
        return res.status(200).json({
          materials: [],
          pagination: {
            totalMaterials: 0,
            totalPages: 0,
            currentPage: pageNum,
            limit: limitNum,
          },
        });
      }

      query.uploaderId = new mongoose.Types.ObjectId(uploaderId);

      if (status && status !== "all") {
        query.status = status;
      }
    }

    // 2. Lọc theo người thích
    else if (likedBy !== undefined) {
      if (
        !likedBy ||
        likedBy === "undefined" ||
        likedBy === "null" ||
        likedBy === ""
      ) {
        return res.status(200).json({
          materials: [],
          pagination: {
            totalMaterials: 0,
            totalPages: 0,
            currentPage: pageNum,
            limit: limitNum,
          },
        });
      }

      query.likes = new mongoose.Types.ObjectId(likedBy);

      if (!status || status !== "all") {
        query.status = "approved";
      }
    }

    // 3. Danh sách chung
    else {
      if (status === "all") {
        // Không lọc status, thường dùng cho admin
      } else if (status) {
        query.status = status;
      } else {
        query.status = "approved";
      }
    }

    // Lọc category phân cấp
    if (category && category !== "all") {
      try {
        const targetId = new mongoose.Types.ObjectId(category);
        const allCategoryIds = await getAllChildCategoryIds(targetId);

        query.categoryId = {
          $in: allCategoryIds,
        };
      } catch (err) {
        console.error("Invalid Category ID format:", err.message);
      }
    }

    if (major && major !== "all") {
      query.majorId = new mongoose.Types.ObjectId(major);
    }

    if (academicYear && academicYear !== "all") {
      query.academicYear = academicYear;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    let sortOptions = {
      createdAt: -1,
    };

    if (sortBy === "most_viewed") {
      sortOptions = {
        "metrics.viewCount": -1,
      };
    } else if (sortBy === "most_downloaded") {
      sortOptions = {
        "metrics.downloadCount": -1,
      };
    } else if (sortBy === "top_rated") {
      sortOptions = {
        "metrics.averageRating": -1,
      };
    }

    console.log("EXECUTE QUERY:", JSON.stringify(query));

    const totalMaterials = await Material.countDocuments(query);

    const materials = await Material.find(query)
      .populate("uploaderId", "fullName email avatar")
      .populate("categoryId", "name")
      .populate("majorId", "name")
      .populate("tags", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      materials,
      pagination: {
        totalMaterials,
        totalPages: Math.ceil(totalMaterials / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("GET MATERIALS ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    // Exclude contentText (tối đa 8000 chars) và embedding (1536 floats) khỏi response.
    // Frontend chỉ cần hasContentText (boolean) để quyết định có hiện chat panel không.
    const material = await Material.findById(req.params.id)
      .select("-embedding")
      .populate("uploaderId", "fullName avatar")
      .populate("categoryId", "name")
      .populate("majorId", "name")
      .populate("tags", "name");

    if (!material) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    material.metrics.viewCount += 1;
    await material.save();

    recordInteraction(req.user?._id, material._id, "view", 1);

    const docObj = material.toObject();
    docObj.hasContentText = !!(docObj.contentText && docObj.contentText.trim().length > 0);
    delete docObj.contentText;

    return res.status(200).json(docObj);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Không tìm thấy",
      });
    }

    // Chỉ chủ sở hữu hoặc admin được sửa tài liệu
    if (
      material.uploaderId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa tài liệu này" });
    }

    const {
      title,
      description,
      materialType,
      categoryId,
      majorId,
      status,
      academicYear,
    } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (materialType) material.materialType = materialType;
    if (categoryId) material.categoryId = categoryId;
    if (majorId) material.majorId = majorId;
    if (academicYear) material.academicYear = academicYear;

    let newFileContent = "";
    if (req.file) {
      try {
        // Trích nội dung file mới TRƯỚC khi upload (buffer còn trong RAM)
        newFileContent = await extractText(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
        );

        const uploadResult = await uploadFile(req.file);
        material.fileUrl = uploadResult.url;
        material.sourceType = "upload";

        // Cập nhật materialType nếu chưa có hoặc là 'other'
        if (!materialType || materialType === "other") {
          const ext = req.file.originalname.split(".").pop().toLowerCase();
          if (["pdf"].includes(ext)) material.materialType = "pdf";
          else if (["doc", "docx", "odt", "txt"].includes(ext)) material.materialType = "docx";
          else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) material.materialType = "zip";
          else if (["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) material.materialType = "video";
          else if (["ppt", "pptx"].includes(ext)) material.materialType = "pptx";
        }
      } catch (uploadError) {
        console.error("Update upload error:", uploadError);
        return res.status(500).json({
          message: "Lỗi khi tải file mới lên",
          error: uploadError.message,
        });
      }
    }

    // Sinh lại embedding nếu: đổi tiêu đề/mô tả, đổi file, hoặc embedding đang rỗng.
    // Re-embed đặt SAU xử lý file để gồm được nội dung file mới (nếu có).
    const contentChanged =
      (title !== undefined && title !== "") ||
      (description !== undefined && description !== "") ||
      !!req.file;
    const embeddingMissing =
      !Array.isArray(material.embedding) || material.embedding.length === 0;

    if (contentChanged || embeddingMissing) {
      const newVector = await safeGenerateEmbedding(
        material.title,
        material.description,
        newFileContent,
      );
      if (newVector && newVector.length > 0) {
        material.embedding = newVector;
      }
    }

    // Cập nhật contentText khi có file mới được trích nội dung.
    if (req.file && newFileContent) {
      material.contentText = newFileContent;
    }

    if (status && req.user.role === "admin") {
      material.status = status;
    }

    await material.save();

    return res.status(200).json({
      message: "Cập nhật thành công",
      material,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi",
      error: error.message,
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    // Chỉ chủ sở hữu hoặc admin được xóa tài liệu
    if (
      material.uploaderId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa tài liệu này" });
    }

    const materialId = material._id;

    // Xóa file vật lý (chỉ với tài liệu upload; link ngoài tự bỏ qua trong deleteFile)
    if (material.sourceType === "upload") {
      await deleteFile(material.fileUrl);
    }

    // Dọn dữ liệu liên quan để tránh bản ghi mồ côi
    await Promise.all([
      Review.deleteMany({ materialId }),
      Comment.deleteMany({ materialId }),
      Report.deleteMany({ materialId }),
      Interaction.deleteMany({ materialId }),
      SearchLog.deleteMany({ clickedMaterialId: materialId }),
      StudyCollection.updateMany(
        { materialIds: materialId },
        { $pull: { materialIds: materialId } },
      ),
    ]);

    await material.deleteOne();

    return res.status(200).json({
      message: "Xóa thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi",
      error: error.message,
    });
  }
};

const incrementDownload = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    material.metrics.downloadCount += 1;

    await material.save();

    // Ghi tương tác tải (chỉ khi đã đăng nhập)
    recordInteraction(req.user?._id, material._id, "download", 3);

    return res.status(200).json({
      message: "Tăng lượt tải",
      downloadCount: material.metrics.downloadCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi",
      error: error.message,
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    const userId = req.user._id.toString();

    const index = material.likes.findIndex(
      (id) => id.toString() === userId
    );

    let isLiked = false;

    if (index === -1) {
      material.likes.push(req.user._id);
      isLiked = true;
    } else {
      material.likes.splice(index, 1);
      isLiked = false;
    }

    await material.save();

    // Ghi tương tác thích (chỉ khi vừa thích, không ghi khi bỏ thích)
    if (isLiked) {
      recordInteraction(req.user._id, material._id, "like", 5);
    }

    return res.status(200).json({
      message: "OK",
      likesCount: material.likes.length,
      isLiked,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi",
      error: error.message,
    });
  }
};

const getMaterialStats = async (req, res) => {
  try {
    const total = await Material.countDocuments();
    const pending = await Material.countDocuments({ status: "pending" });
    const approved = await Material.countDocuments({ status: "approved" });
    const totalUsers = await User.countDocuments();

    // 1. Thống kê tổng lượt xem và tải
    const metrics = await Material.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$metrics.viewCount" },
          totalDownloads: { $sum: "$metrics.downloadCount" },
        },
      },
    ]);

    const totalViews = metrics[0]?.totalViews || 0;
    const totalDownloads = metrics[0]?.totalDownloads || 0;

    // 2. Phân bổ theo chuyên ngành
    const majorDistribution = await Material.aggregate([
      {
        $group: {
          _id: "$majorId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "majors",
          localField: "_id",
          foreignField: "_id",
          as: "majorInfo",
        },
      },
      {
        $unwind: "$majorInfo",
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$majorInfo.name",
        },
      },
    ]);

    // 3. Xu hướng upload theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyUploads = await Material.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return res.status(200).json({
      summary: {
        totalMaterials: total,
        pendingMaterials: pending,
        approvedMaterials: approved,
        totalUsers,
        totalViews,
        totalDownloads,
      },
      majorDistribution,
      monthlyUploads,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi",
      error: error.message,
    });
  }
};

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  incrementDownload,
  toggleLike,
  getMaterialStats,
};