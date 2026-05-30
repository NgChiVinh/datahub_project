const cloudinary = require("../config/cloudinary");
const r2 = require("../config/r2");

const { PutObjectCommand } = require("@aws-sdk/client-s3");

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

  const fileName = `${Date.now()}-${file.originalname}`;

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

module.exports = uploadFile;
