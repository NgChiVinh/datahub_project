const Tag = require("../models/Tag");
const slugify = require("slugify");

// [1] Tạo tag mới
const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const slug = slugify(name, { lower: true });

    // check trùng
    const existing = await Tag.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Tag đã tồn tại" });
    }

    const newTag = new Tag({ name, slug });
    await newTag.save();

    res.status(201).json({
      message: "Tạo tag thành công",
      tag: newTag,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo tag", error });
  }
};

// [2] Lấy tất cả tag
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy tag", error });
  }
};

// [3] Lấy tag theo ID
const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: "Không tìm thấy tag" });
    }

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy tag", error });
  }
};

// [4] Cập nhật tag
const updateTag = async (req, res) => {
  try {
    const { name } = req.body;

    let updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    const updatedTag = await Tag.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedTag) {
      return res.status(404).json({ message: "Không tìm thấy tag" });
    }

    res.status(200).json({
      message: "Cập nhật tag thành công",
      tag: updatedTag,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật tag", error });
  }
};

// [5] Xóa tag
const deleteTag = async (req, res) => {
  try {
    const deletedTag = await Tag.findByIdAndDelete(req.params.id);

    if (!deletedTag) {
      return res.status(404).json({ message: "Không tìm thấy tag" });
    }

    res.status(200).json({ message: "Xóa tag thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa tag", error });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
};
