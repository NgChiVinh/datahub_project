//controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { studentId, fullName, email, password, majorId } = req.body;

    // check email hoặc studentId
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email hoặc mã sinh viên đã tồn tại",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // tạo user đúng schema
    const newUser = new User({
      studentId,
      fullName,
      email,
      password: hashedPassword,
      majorId,
    });

    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    // so sánh password đúng field
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng" });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// GET ALL USERS (admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE ROLE
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.status(200).json({
      message: "Cập nhật vai trò thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật vai trò", error });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá người dùng", error });
  }
};

// UPDATE PROFILE (CHỈ FIELD CÓ TRONG MODEL)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const { fullName, preferences } = req.body;

    if (fullName) user.fullName = fullName;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: {
        _id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thông tin", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUserRole,
  deleteUser,
  updateUserProfile,
};
