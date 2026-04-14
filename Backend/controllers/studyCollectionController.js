const StudyCollection = require("../models/StudyCollection");

// CREATE
const createCollection = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const collection = new StudyCollection({
      userId: req.user._id,
      name,
      description,
      isPublic,
    });

    await collection.save();

    res.status(201).json({
      message: "Tạo collection thành công",
      collection,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo collection", error });
  }
};

// GET tất cả collection (public + của user)
const getCollections = async (req, res) => {
  try {
    const collections = await StudyCollection.find({
      $or: [{ isPublic: true }, { userId: req.user._id }],
    })
      .populate("userId", "fullName")
      .populate("materialIds", "title fileUrl");

    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET by ID
const getCollectionById = async (req, res) => {
  try {
    const collection = await StudyCollection.findById(req.params.id)
      .populate("userId", "fullName")
      .populate("materialIds");

    if (!collection) {
      return res.status(404).json({ message: "Không tìm thấy collection" });
    }

    // check quyền (private)
    if (
      !collection.isPublic &&
      collection.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE
const updateCollection = async (req, res) => {
  try {
    const collection = await StudyCollection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Không tìm thấy collection" });
    }

    // chỉ owner mới sửa
    if (collection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền sửa" });
    }

    const { name, description, isPublic } = req.body;

    if (name) collection.name = name;
    if (description) collection.description = description;
    if (typeof isPublic !== "undefined") collection.isPublic = isPublic;

    await collection.save();

    res.status(200).json({
      message: "Cập nhật thành công",
      collection,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi update", error });
  }
};

// DELETE
const deleteCollection = async (req, res) => {
  try {
    const collection = await StudyCollection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Không tìm thấy collection" });
    }

    // chỉ owner mới xoá
    if (collection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xoá" });
    }

    await collection.deleteOne();

    res.status(200).json({ message: "Xoá collection thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá", error });
  }
};

// ADD material vào collection
const addMaterialToCollection = async (req, res) => {
  try {
    const { materialId } = req.body;

    const collection = await StudyCollection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Không tìm thấy collection" });
    }

    if (collection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    if (!collection.materialIds.includes(materialId)) {
      collection.materialIds.push(materialId);
      await collection.save();
    }

    res.status(200).json({
      message: "Thêm tài liệu thành công",
      collection,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm tài liệu", error });
  }
};

// REMOVE material
const removeMaterialFromCollection = async (req, res) => {
  try {
    const { materialId } = req.body;

    const collection = await StudyCollection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Không tìm thấy collection" });
    }

    if (collection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    collection.materialIds = collection.materialIds.filter(
      (id) => id.toString() !== materialId,
    );

    await collection.save();

    res.status(200).json({
      message: "Xoá tài liệu khỏi collection",
      collection,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá tài liệu", error });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addMaterialToCollection,
  removeMaterialFromCollection,
};
