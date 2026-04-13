// middleware/multer.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "materials";

    let resource_type = "auto"; // cho phép mọi loại file

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

// filter loại file
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File không hợp lệ!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB
});

module.exports = upload;
