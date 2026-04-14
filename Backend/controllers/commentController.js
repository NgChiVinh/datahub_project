const Comment = require("../models/Comment");

// CREATE (comment hoặc reply)
const createComment = async (req, res) => {
  try {
    const { materialId, content, parentId } = req.body;

    const comment = new Comment({
      materialId,
      userId: req.user._id,
      content,
      parentId: parentId || null,
    });

    await comment.save();

    res.status(201).json({
      message: "Bình luận thành công",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo comment", error });
  }
};

// GET comments theo material (tree structure)
const getCommentsByMaterial = async (req, res) => {
  try {
    const comments = await Comment.find({
      materialId: req.params.materialId,
    })
      .populate("userId", "fullName")
      .sort({ createdAt: 1 });

    // build tree
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c._id] = { ...c._doc, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    res.status(200).json(roots);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// UPDATE
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy comment" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền sửa" });
    }

    comment.content = req.body.content || comment.content;

    await comment.save();

    res.status(200).json({
      message: "Cập nhật thành công",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi update", error });
  }
};

// DELETE (xoá cả replies)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy comment" });
    }

    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Không có quyền xoá" });
    }

    // xoá tất cả replies (đệ quy đơn giản)
    const deleteReplies = async (parentId) => {
      const replies = await Comment.find({ parentId });
      for (let reply of replies) {
        await deleteReplies(reply._id);
        await reply.deleteOne();
      }
    };

    await deleteReplies(comment._id);
    await comment.deleteOne();

    res.status(200).json({ message: "Xoá comment thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá", error });
  }
};

module.exports = {
  createComment,
  getCommentsByMaterial,
  updateComment,
  deleteComment,
};
