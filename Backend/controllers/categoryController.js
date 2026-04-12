const Category = require("../models/Category");
const slugify = require("slugify");

// [1] Thêm danh mục mới
const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Tạo slug từ name
    const slug = slugify(name, { lower: true });

    // Kiểm tra slug đã tồn tại chưa
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const newCategory = new Category({
      name,
      slug,
      description,
      parentId: parentId || null,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Thêm danh mục thành công",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm danh mục", error });
  }
};

// [2] Lấy danh sách danh mục (có populate parent)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentId", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh mục", error });
  }
};

// [3] Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentId",
      "name slug",
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh mục", error });
  }
};

// [4] Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    let updateData = {
      description,
      parentId: parentId || null,
    };

    // Nếu có name thì update slug luôn
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({
      message: "Cập nhật thành công",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật danh mục", error });
  }
};

// [5] Xóa danh mục (check con trước khi xóa)
const deleteCategory = async (req, res) => {
  try {
    // Check có danh mục con không
    const child = await Category.findOne({ parentId: req.params.id });

    if (child) {
      return res.status(400).json({
        message: "Không thể xóa vì còn danh mục con",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa danh mục", error });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
