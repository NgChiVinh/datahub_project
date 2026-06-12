const Major = require("../models/Major");
const Material = require("../models/Material");

// CREATE Major
const createMajor = async (req, res) => {
  try {
    const { majorCode, name, department } = req.body;

    const existing = await Major.findOne({ majorCode });
    if (existing) {
      return res.status(400).json({ message: "Mã ngành đã tồn tại" });
    }

    const major = new Major({ majorCode, name, department });
    await major.save();

    res.status(201).json({
      message: "Tạo ngành thành công",
      major,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET all majors (kèm số tài liệu đã duyệt theo từng ngành)
const getMajors = async (req, res) => {
  try {
    const [majors, counts] = await Promise.all([
      Major.find().sort({ createdAt: -1 }),
      Material.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$majorId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = Object.fromEntries(
      counts.map((c) => [c._id?.toString(), c.count])
    );

    const result = majors.map((m) => ({
      ...m.toObject(),
      materialCount: countMap[m._id.toString()] || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET major by ID
const getMajorById = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id);

    if (!major) {
      return res.status(404).json({ message: "Không tìm thấy ngành" });
    }

    res.status(200).json(major);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE major
const updateMajor = async (req, res) => {
  try {
    const { majorCode, name, department } = req.body;

    const major = await Major.findById(req.params.id);
    if (!major) {
      return res.status(404).json({ message: "Không tìm thấy ngành" });
    }

    if (majorCode) major.majorCode = majorCode;
    if (name) major.name = name;
    if (department) major.department = department;

    await major.save();

    res.status(200).json({
      message: "Cập nhật ngành thành công",
      major,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật ngành", error });
  }
};

// DELETE major
const deleteMajor = async (req, res) => {
  try {
    const deleted = await Major.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy ngành" });
    }

    res.status(200).json({ message: "Xóa ngành thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá ngành", error });
  }
};

module.exports = {
  createMajor,
  getMajors,
  getMajorById,
  updateMajor,
  deleteMajor,
};
