const cloudinary = require("../config/cloudinary");
const r2 = require("../config/r2");

const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const path = require("path");

const uploadFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

  const isVideo = videoExts.includes(ext);

  // ======================
  // VIDEO -> CLOUDINARY
  // ======================

  if (isVideo) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "materials/videos",
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              provider: "cloudinary",
            });
          },
        )
        .end(file.buffer);
    });
  }

  // ======================
  // DOCUMENT -> R2
  // ======================

  // Chuẩn hóa tên file để URL không chứa ký tự đặc biệt gây hỏng đường dẫn
  // (vd dấu "#" bị hiểu là fragment -> 404). Bỏ dấu tiếng Việt, thay ký tự
  // lạ/khoảng trắng bằng "-", giữ nguyên phần mở rộng.
  const sanitizeFileName = (name) => {
    const base = path.basename(name, path.extname(name)); // cắt đuôi gốc (mọi case)
    const cleanBase = base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // bỏ dấu tiếng Việt
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9._-]+/g, "-") // ký tự còn lại -> "-"
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
    return (cleanBase || "file") + ext; // ext đã được lowercase ở trên
  };

  const fileName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: `materials/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  const fileUrl = `${process.env.R2_PUBLIC_URL}/materials/${fileName}`;

  return {
    url: fileUrl,
    provider: "r2",
  };
};

// Xóa file vật lý đã upload, suy ra nơi lưu từ chính URL.
// - Cloudinary (video): URL chứa "res.cloudinary.com" -> destroy theo public_id.
// - R2 (document): còn lại -> DeleteObject theo key "materials/<tên>".
// Chỉ áp dụng cho file upload; tài liệu dạng link ngoài (YouTube/Drive) thì bỏ qua.
// Không ném lỗi: việc xóa file không được phép làm hỏng luồng xóa bản ghi DB.
const deleteFile = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return;

  try {
    if (fileUrl.includes("res.cloudinary.com")) {
      // Lấy public_id (gồm folder, bỏ phần version "/v123/" và đuôi mở rộng)
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(match[1], { resource_type: "video" });
      }
      return;
    }

    const publicBase = process.env.R2_PUBLIC_URL;
    if (publicBase && fileUrl.startsWith(publicBase)) {
      // key = phần đường dẫn sau domain public, vd "materials/123-ten.pdf"
      const key = fileUrl.slice(publicBase.length).replace(/^\/+/, "");
      if (key) {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
          }),
        );
      }
    }
  } catch (err) {
    console.error("Lỗi xóa file vật lý:", err.message);
  }
};

module.exports = uploadFile;
module.exports.deleteFile = deleteFile;
