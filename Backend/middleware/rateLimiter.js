const rateLimit = require("express-rate-limit");

// Giới hạn cho các thao tác xác thực nhạy cảm (login/register/forgot-password)
// nhằm chống dò mật khẩu (brute-force). 10 lần / 15 phút / IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Quá nhiều lần thử, vui lòng đợi 15 phút rồi thử lại.",
  },
});

module.exports = { authLimiter };
