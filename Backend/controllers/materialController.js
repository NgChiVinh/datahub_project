const Material = require("../models/Material");
const Tag = require("../models/Tag");
const Notification = require("../models/Notification");
const slugify = require("slugify");

// CREATE (upload file hoặc gửi link + lưu DB)
const createMaterial = async (req, res) => {
  try {
    const { title, description, materialType, categoryId, tags, link, academicYear } = req.body;
    let finalFileUrl = "";
    let finalSourceType = "upload";
    let finalMaterialType = materialType || "other";

    // 1. Xử lý Nguồn dữ liệu (File hoặc Link)
    if (req.file) {
      finalFileUrl = req.file.path;
      finalSourceType = "upload";
      
      // Tự động nhận diện loại tài liệu dựa trên extension nếu client không gửi materialType
      if (!materialType || materialType === "other") {
        const ext = req.file.originalname.split(".").pop().toLowerCase();
        if (["pdf"].includes(ext)) finalMaterialType = "pdf";
        else if (["doc", "docx", "odt", "txt"].includes(ext)) finalMaterialType = "docx";
        else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) finalMaterialType = "zip";
        else if (["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) finalMaterialType = "video";
        else if (["ppt", "pptx"].includes(ext)) finalMaterialType = "pptx";
        else finalMaterialType = "other";
      } else {
        finalMaterialType = materialType;
      }
    } else if (link) {
      finalFileUrl = link;
      finalSourceType = "link";
      
      // Logic nhận diện video nâng cao
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      const videoExtRegex = /\.(mp4|mov|avi|mkv|webm|flv)$/i;
      
      if (youtubeRegex.test(link) || videoExtRegex.test(link)) {
        finalMaterialType = "video";
      } else {
        finalMaterialType = materialType || "other";
      }
    } else {
      return res.status(400).json({ message: "Vui lòng upload file hoặc cung cấp đường dẫn tài liệu" });
    }

    // Đảm bảo materialType là một trong các giá trị enum của DB
    if (!["pdf", "docx", "zip", "video", "pptx", "other"].includes(finalMaterialType)) {
      finalMaterialType = "other";
    }

    // 2. Xử lý Tags thông minh (Hỗ trợ cả ID hiện có và Tên tag mới)
    let processedTags = [];
    if (tags) {
      try {
        const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
        if (Array.isArray(parsedTags)) {
          for (const tagInput of parsedTags) {
            // Nếu là ObjectId (24 ký tự) - Giả định là ID tag hiện có
            if (tagInput.length === 24 && /^[0-9a-fA-F]{24}$/.test(tagInput)) {
              processedTags.push(tagInput);
            } else {
              // Nếu là text - Xử lý tạo tag mới hoặc tìm tag tương đương
              const slug = slugify(tagInput, { lower: true });
              let tag = await Tag.findOne({ slug });
              
              if (!tag) {
                tag = new Tag({ name: tagInput, slug });
                await tag.save();
              }
              processedTags.push(tag._id);
            }
          }
        }
      } catch (e) {
        console.error("Tags processing failed:", e.message);
      }
    }

    const materialData = {
      title,
      description,
      materialType: finalMaterialType,
      sourceType: finalSourceType,
      academicYear: ["Năm 1", "Năm 2", "Năm 3", "Năm 4"].includes(academicYear) ? academicYear : "Khác",
      categoryId,
      majorId: req.user.majorId || null, // Lưu ngành của người đăng
      uploaderId: req.user._id,
      fileUrl: finalFileUrl,
      tags: processedTags,
      status: "pending" // Đảm bảo luôn là pending khi mới tạo
    };

    const material = new Material(materialData);
    const savedMaterial = await material.save();
    console.log("Material saved successfully:", savedMaterial._id);

    res.status(201).json({
      message: "Chia sẻ tài liệu thành công. Vui lòng đợi quản trị viên phê duyệt.",
      material: savedMaterial,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Lỗi upload tài liệu", error: error.message });
  }
};

// GET ALL (Có hỗ trợ lọc, tìm kiếm và sắp xếp)
const getMaterials = async (req, res) => {
  try {
    const { category, major, academicYear, search, status, uploaderId, sortBy, materialType } = req.query;
    
    // Xây dựng bộ lọc dữ liệu
    let query = {};
    
    // Lọc theo loại tài liệu (video, pdf, docx, etc.)
    if (materialType) {
      if (materialType === "not_video") {
        query.materialType = { $ne: "video" }; // Lấy tất cả trừ video
      } else {
        query.materialType = materialType;
      }
    }
    
    // Ưu tiên lọc theo uploaderId nếu có (cho trang cá nhân)
    if (uploaderId) {
      query.uploaderId = uploaderId;
      if (status && status !== "all") {
        query.status = status;
      }
    } else {
      // Cho trang cộng đồng hoặc admin
      if (status && status !== "all") {
        query.status = status;
      } else if (!status) {
        query.status = "approved"; // Mặc định chỉ lấy bài đã duyệt cho public
      }
      // status === "all" -> không lọc theo status (lấy hết cho Admin)
    }

    if (category && category !== "all") {
      query.categoryId = category;
    }

    if (major && major !== "all") {
      query.majorId = major;
    }

    if (academicYear && academicYear !== "all") {
      query.academicYear = academicYear;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Xử lý sắp xếp
    let sortOptions = { createdAt: -1 }; // Mặc định: Mới nhất
    if (sortBy === "most_viewed") sortOptions = { "metrics.viewCount": -1 };
    else if (sortBy === "most_downloaded") sortOptions = { "metrics.downloadCount": -1 };
    else if (sortBy === "top_rated") sortOptions = { "metrics.averageRating": -1 };

    const materials = await Material.find(query)
      .populate("uploaderId", "fullName email avatar")
      .populate("categoryId", "name")
      .populate("majorId", "name")
      .populate("tags", "name")
      .sort(sortOptions);

    res.status(200).json(materials);
  } catch (error) {
    console.error("Get Materials Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách tài liệu", error: error.message });
  }
};

// GET BY ID
const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate("uploaderId", "fullName")
      .populate("categoryId", "name")
      .populate("majorId", "name")
      .populate("tags", "name");

    if (!material) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    // tăng view count
    material.metrics.viewCount += 1;
    await material.save();

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    // Kiểm tra quyền: Admin được sửa tất cả, User chỉ được sửa bài của mình
    const isOwner = material.uploaderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa tài liệu này" });
    }

    const { title, description, materialType, categoryId, status, academicYear, majorId } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (materialType) material.materialType = materialType;
    if (categoryId) material.categoryId = categoryId;
    if (academicYear) material.academicYear = academicYear;
    if (majorId) material.majorId = majorId;

    // Chỉ Admin mới có quyền cập nhật trạng thái (duyệt/từ chối)
    if (status && isAdmin) {
      const oldStatus = material.status;
      material.status = status;

      // Tạo thông báo nếu trạng thái thay đổi
      if (oldStatus !== status) {
        let notificationType = "system";
        let message = "";

        if (status === "approved") {
          notificationType = "material_approved";
          message = `Chúc mừng! Tài liệu "${material.title}" của bạn đã được phê duyệt.`;
        } else if (status === "rejected") {
          notificationType = "material_rejected";
          message = `Rất tiếc, tài liệu "${material.title}" của bạn đã không được phê duyệt.`;
        }

        if (message) {
          await Notification.create({
            userId: material.uploaderId,
            type: notificationType,
            message: message,
            link: `/documents/${material._id}`
          });
        }
      }
    }

    // nếu upload file mới
    if (req.file) {
      material.fileUrl = req.file.path;
    }

    await material.save();

    res.status(200).json({
      message: "Cập nhật thành công",
      material,
    });
  } catch (error) {
    console.error("Update Material Error:", error);
    res.status(500).json({ message: "Lỗi cập nhật tài liệu", error: error.message });
  }
};

// DELETE
const deleteMaterial = async (req, res) => {
  try {
    const deleted = await Material.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá", error });
  }
};

// Tăng lượt tải về
const incrementDownload = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }
    material.metrics.downloadCount += 1;
    await material.save();
    res.status(200).json({ message: "Đã tăng lượt tải", downloadCount: material.metrics.downloadCount });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Toggle Like tài liệu
const toggleLike = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    const userId = req.user._id;
    const index = material.likes.indexOf(userId);

    if (index === -1) {
      material.likes.push(userId);
    } else {
      material.likes.splice(index, 1);
    }

    await material.save();
    res.status(200).json({ 
      message: index === -1 ? "Đã thích tài liệu" : "Đã bỏ thích", 
      likesCount: material.likes.length,
      isLiked: index === -1 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  incrementDownload,
  toggleLike, // Xuất hàm mới
};
