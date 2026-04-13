//controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { studentId, fullName, email, password, majorId } = req.body;

    // 1. Kiểm tra định dạng Email Văn Lang
    const vluEmailRegex = /^[a-zA-Z0-9._%+-]+@vanlanguni\.vn$/;
    if (!vluEmailRegex.test(email)) {
      return res.status(400).json({
        message: "Chỉ chấp nhận email sinh viên Văn Lang (@vanlanguni.vn)",
      });
    }

    // 2. Tự động kiểm tra MSSV từ Email (nếu email có chứa MSSV)
    // Ví dụ: nam.2174802010123@vanlanguni.vn -> MSSV là 2174802010123
    const emailParts = email.split("@")[0].split(".");
    const mssvFromEmail = emailParts[emailParts.length - 1];

    // Nếu phần cuối của email là số và dài (mssv thường > 7 số)
    if (!isNaN(mssvFromEmail) && mssvFromEmail.length >= 7) {
      if (mssvFromEmail !== studentId) {
        return res.status(400).json({
          message: `Mã sinh viên (${studentId}) không khớp với mã trong Email (${mssvFromEmail})`,
        });
      }
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự trở lên" });
    }

    // 4. Kiểm tra trùng lặp
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email hoặc mã sinh viên này đã được đăng ký",
      });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      studentId,
      fullName,
      email,
      password: hashedPassword,
      majorId,
    });

    await newUser.save();

    // Tự động tạo Token sau khi đăng ký thành công
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role }, 
      process.env.SECRET_KEY, 
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      message: "Đăng ký tài khoản sinh viên thành công",
      token, // Trả về token để tự động đăng nhập
      user: { 
        _id: newUser._id,
        email: newUser.email, 
        studentId: newUser.studentId, 
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký", error: error.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user và populate ngành học
    const user = await User.findOne({ email }).populate("majorId", "name");
    
    if (!user) {
      return res.status(400).json({ message: "Tài khoản sinh viên không tồn tại" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản của bạn đang bị tạm khóa" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    // Tạo JWT Token (chứa cả role để phân quyền Frontend)
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.SECRET_KEY, 
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        major: user.majorId?.name
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập", error: error.message });
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

// GET ME (Lấy thông tin user hiện tại từ Token)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("majorId", "name").select("-password");
    res.json({
      _id: user._id,
      studentId: user.studentId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      major: user.majorId?.name
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông tin người dùng" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe, // Xuất hàm mới
  getUsers,
  updateUserRole,
  deleteUser,
  updateUserProfile,
};
