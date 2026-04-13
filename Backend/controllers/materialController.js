const Material = require("../models/Material");

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
      if (!materialType) {
        const ext = req.file.originalname.split(".").pop().toLowerCase();
        if (["pdf"].includes(ext)) finalMaterialType = "pdf";
        else if (["doc", "docx"].includes(ext)) finalMaterialType = "docx";
        else if (["zip", "rar", "7z"].includes(ext)) finalMaterialType = "zip";
        else if (["mp4", "mov", "avi"].includes(ext)) finalMaterialType = "video";
        else if (["ppt", "pptx"].includes(ext)) finalMaterialType = "pptx";
      }
    } else if (link) {
      finalFileUrl = link;
      finalSourceType = "link";
      if (link.includes("youtube.com") || link.includes("youtu.be")) {
        finalMaterialType = "video";
      }
    } else {
      return res.status(400).json({ message: "Vui lòng upload file hoặc cung cấp đường dẫn tài liệu" });
    }

    // 2. Xử lý Tags an toàn (Tạm thời lọc bỏ nếu không phải ObjectId hợp lệ để tránh lỗi DB)
    let processedTags = [];
    if (tags) {
      try {
        const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
        if (Array.isArray(parsedTags)) {
          // Chỉ lấy những tag là ObjectId hợp lệ (hoặc bỏ qua bước này nếu bạn chưa có ID tag)
          // Để fix nhanh: Nếu là string (từ client gửi lên), chúng ta tạm thời bỏ qua cho đến khi có logic tạo Tag tự động
          processedTags = parsedTags.filter(id => id.length === 24); 
        }
      } catch (e) {
        console.error("Tags parsing failed:", e.message);
      }
    }

    const materialData = {
      title,
      description,
      materialType: finalMaterialType,
      sourceType: finalSourceType,
      academicYear: ["Năm 1", "Năm 2", "Năm 3", "Năm 4"].includes(academicYear) ? academicYear : "Khác",
      categoryId,
      uploaderId: req.user._id,
      fileUrl: finalFileUrl,
    };

    // Chỉ thêm tags nếu có dữ liệu hợp lệ
    if (processedTags.length > 0) {
      materialData.tags = processedTags;
    }

    const material = new Material(materialData);
    await material.save();

    res.status(201).json({
      message: "Chia sẻ tài liệu thành công",
      material,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Lỗi upload tài liệu", error: error.message });
  }
};

// GET ALL
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate("uploaderId", "fullName email")
      .populate("categoryId", "name")
      .populate("tags", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET BY ID
const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate("uploaderId", "fullName")
      .populate("categoryId", "name")
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

    const { title, description, materialType, categoryId, status } = req.body;

    if (title) material.title = title;
    if (description) material.description = description;
    if (materialType) material.materialType = materialType;
    if (categoryId) material.categoryId = categoryId;
    if (status) material.status = status;

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
    res.status(500).json({ message: "Lỗi update", error });
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

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};
