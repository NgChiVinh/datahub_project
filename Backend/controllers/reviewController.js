const Review = require("../models/Review");
const Material = require("../models/Material");

//Helper: cập nhật rating trung bình
const updateMaterialRating = async (materialId) => {
  const reviews = await Review.find({ materialId });

  const reviewCount = reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  await Material.findByIdAndUpdate(materialId, {
    "metrics.averageRating": avgRating,
    "metrics.reviewCount": reviewCount,
  });
};

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const { materialId, rating, content } = req.body;

    // check đã review chưa (1 user chỉ review 1 lần)
    const existing = await Review.findOne({
      materialId,
      userId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Bạn đã review rồi" });
    }

    const review = new Review({
      materialId,
      userId: req.user._id,
      rating,
      content,
    });

    await review.save();

    // cập nhật rating
    await updateMaterialRating(materialId);

    res.status(201).json({
      message: "Đánh giá thành công",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo review", error });
  }
};

// GET reviews theo material
const getReviewsByMaterial = async (req, res) => {
  try {
    const reviews = await Review.find({
      materialId: req.params.materialId,
    })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE REVIEW
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy review" });
    }

    // chỉ owner mới sửa
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền sửa" });
    }

    const { rating, content } = req.body;

    if (rating) review.rating = rating;
    if (content) review.content = content;

    await review.save();

    await updateMaterialRating(review.materialId);

    res.status(200).json({
      message: "Cập nhật review thành công",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi update", error });
  }
};

// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy review" });
    }

    // owner hoặc admin xoá
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Không có quyền xoá" });
    }

    const materialId = review.materialId;

    await review.deleteOne();

    await updateMaterialRating(materialId);

    res.status(200).json({ message: "Xoá review thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá", error });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "fullName")
      .populate("materialId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = {
  createReview,
  getReviewsByMaterial,
  updateReview,
  deleteReview,
  getAllReviews,
};
