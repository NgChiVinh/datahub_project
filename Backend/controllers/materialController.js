const Material = require("../models/Material");

// CREATE (upload file + lưu DB)
const createMaterial = async (req, res) => {
  try {
    const { title, description, materialType, categoryId, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload file" });
    }

    const material = new Material({
      title,
      description,
      materialType,
      categoryId,
      uploaderId: req.user._id,
      fileUrl: req.file.path, // URL từ Cloudinary
      tags: tags ? JSON.parse(tags) : [],
    });

    await material.save();

    res.status(201).json({
      message: "Upload tài liệu thành công",
      material,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi upload", error });
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
