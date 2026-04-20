"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function DocumentDetailPage() {
  const params = useParams();
  const [doc, setDoc] = useState(null);
  const [relatedDocs, setRelatedDocs] = useState([]);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // preview, info, comments
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchDocData = async () => {
      try {
        setIsLoading(true);
        const [docRes, commentRes, reviewRes] = await Promise.all([
          fetch(`http://localhost:5000/api/materials/${params.id}`),
          fetch(`http://localhost:5000/api/comments/material/${params.id}`),
          fetch(`http://localhost:5000/api/reviews/material/${params.id}`),
        ]);

        if (!docRes.ok) throw new Error("Không tìm thấy tài liệu!");

        const docData = await docRes.json();
        const commentData = await commentRes.json();
        const reviewData = await reviewRes.json();

        setDoc(docData);
        setComments(Array.isArray(commentData) ? commentData : []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);

        // Fetch related documents
        if (docData.categoryId?._id) {
          const relatedRes = await fetch(
            `http://localhost:5000/api/materials?category=${docData.categoryId._id}&limit=5`,
          );
          const relatedData = await relatedRes.json();
          if (Array.isArray(relatedData)) {
            setRelatedDocs(relatedData.filter((m) => m._id !== params.id));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchDocData();
  }, [params.id]);

  const handleDownload = async () => {
    if (doc?.fileUrl) {
      window.open(doc.fileUrl, "_blank");
      // Gọi API tăng lượt tải
      try {
        await fetch(
          `http://localhost:5000/api/materials/${params.id}/download`,
          { method: "POST" },
        );
        setDoc((prev) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            downloadCount: (prev.metrics?.downloadCount || 0) + 1,
          },
        }));
      } catch (err) {
        console.error("Lỗi tăng lượt tải:", err);
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!commentInput.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewRes = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId: params.id,
          rating: userRating,
          content: commentInput,
        }),
      });

      if (reviewRes.ok) {
        alert("Cảm ơn bạn đã đánh giá tài liệu!");
        setCommentInput("");
        setUserRating(0);
        const updatedReviews = await fetch(
          `http://localhost:5000/api/reviews/material/${params.id}`,
        ).then((res) => res.json());
        setReviews(updatedReviews);
        // Cập nhật lại thông tin tài liệu để lấy rating trung bình mới
        const updatedDoc = await fetch(
          `http://localhost:5000/api/materials/${params.id}`,
        ).then((res) => res.json());
        setDoc(updatedDoc);
      } else {
        const errorData = await reviewRes.json();
        alert(errorData.message || "Lỗi khi gửi đánh giá.");
      }
    } catch (err) {
      console.error("Review error:", err);
      alert("Lỗi kết nối server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thích tài liệu!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/materials/${params.id}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.isLiked);
        setDoc((prev) => ({
          ...prev,
          likes: data.isLiked
            ? [...(prev.likes || []), "user-id"]
            : (prev.likes || []).filter((id) => id !== "user-id"),
        }));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId: params.id,
          content: commentText,
          parentId: replyingTo?.id || null,
        }),
      });

      if (res.ok) {
        setCommentText("");
        setReplyingTo(null);
        const updatedComments = await fetch(
          `http://localhost:5000/api/comments/material/${params.id}`,
        ).then((res) => res.json());
        setComments(updatedComments);
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cập nhật trạng thái like ban đầu
  useEffect(() => {
    if (doc && localStorage.getItem("user")) {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      setIsLiked(doc.likes?.includes(currentUser._id));
    }
  }, [doc]);

  // Render Comment Component (Recursive for Replies)
  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`flex gap-4 ${isReply ? "ml-12 mt-4" : "mt-8"}`}>
      <div
        className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-200 shrink-0`}
      >
        {comment.userId?.fullName?.charAt(0) || "U"}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
              {comment.userId?.fullName}
            </h5>
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <button
            onClick={() => {
              setReplyingTo({
                id: comment._id,
                name: comment.userId?.fullName,
              });
              setActiveTab("comments");
              window.scrollTo({
                top: document.getElementById("comment-form").offsetTop - 100,
                behavior: "smooth",
              });
            }}
            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
          >
            Trả lời
          </button>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {comment.content}
        </p>

        {/* Render Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!doc?.fileUrl)
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
            Không có bản xem trước
          </p>
        </div>
      );

    if (doc.sourceType === "link") {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="aspect-video w-full bg-slate-100 rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-center space-y-6 px-10">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-emerald-500 group-hover:scale-110 transition-transform">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-2 uppercase italic">
                  Tài liệu từ nguồn bên ngoài
                </h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto">
                  Tài liệu này được lưu trữ tại một trang web khác. Nhấn nút bên
                  dưới để truy cập.
                </p>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-emerald-500 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Mở liên kết gốc
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (doc.materialType === "pdf") {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="w-full aspect-[1/1.4] bg-slate-100 rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden relative">
            <iframe
              src={`${doc.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-none"
              title={doc.title}
            ></iframe>
            <div className="absolute top-0 right-0 p-6 flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl hover:bg-emerald-500 hover:text-white transition-all group"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (doc.materialType === "video") {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden relative group">
            <video src={doc.fileUrl} controls className="w-full h-full"></video>
          </div>
        </div>
      );
    }

    // Default for other types (docx, pptx, zip, etc.)
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="aspect-video w-full bg-slate-50 rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center relative group">
          <div className="text-center space-y-6 px-10">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto text-slate-300 group-hover:scale-110 transition-transform border border-slate-100">
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800 mb-2 uppercase italic">
                Không có bản xem trước trực tiếp
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-xs mx-auto">
                Vui lòng tải xuống tài liệu để xem nội dung đầy đủ
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-4 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
            >
              Tải tài liệu ngay
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );

  if (error || !doc)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-[3rem] shadow-xl border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 mb-4">
            Ối! Có lỗi xảy ra
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            {error || "Tài liệu không tồn tại."}
          </p>
          <Link
            href="/documents"
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
          >
            Quay lại Thư viện
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
      {/* Top Breadcrumb & Actions */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-16 z-40 transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4 py-4 lg:px-12 flex items-center justify-between">
          <Link
            href="/documents"
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </div>
            Quay lại Thư viện
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`p-3 rounded-2xl border transition-all duration-300 active:scale-90 ${isLiked ? "bg-red-50 border-red-100 text-red-500 shadow-lg shadow-red-500/10" : "bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100"}`}
            >
              <svg
                width="20"
                height="20"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </button>
            <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all active:scale-90">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Info Card */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-bl-[8rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>

              <div className="flex flex-wrap gap-3 mb-8 relative z-10">
                <span
                  className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm bg-slate-900 text-white`}
                >
                  {doc.materialType}
                </span>
                <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm">
                  {doc.categoryId?.name}
                </span>
                <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm">
                  {doc.academicYear}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tighter mb-10 relative z-10 uppercase italic">
                {doc.title}
              </h1>

              <div className="flex flex-wrap items-center gap-10 text-slate-400 text-[11px] font-black uppercase tracking-widest border-t border-slate-50 pt-10 relative z-10">
                <div className="flex items-center gap-3 group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors shadow-inner">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  </div>
                  <span>
                    {doc.metrics?.viewCount?.toLocaleString()} LƯỢT XEM
                  </span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:text-amber-500 transition-colors shadow-inner text-amber-500">
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <span>
                    {doc.metrics?.averageRating?.toFixed(1) || 0} (
                    {doc.metrics?.reviewCount || 0} ĐÁNH GIÁ)
                  </span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:text-blue-500 transition-colors shadow-inner">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                  </div>
                  <span>
                    {doc.metrics?.downloadCount?.toLocaleString()} TẢI VỀ
                  </span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:text-amber-500 transition-colors shadow-inner">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <span>
                    {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Content Area */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="flex border-b border-slate-50 px-10 pt-8 gap-4 overflow-x-auto no-scrollbar">
                {[
                  { id: "preview", label: "XEM TRƯỚC", icon: "eye" },
                  { id: "info", label: "CHI TIẾT", icon: "info" },
                  { id: "comments", label: "THẢO LUẬN", icon: "message" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_-4px_10px_rgba(16,185,129,0.3)]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-10 md:p-14 min-h-[500px]">
                {activeTab === "preview" && renderPreview()}

                {activeTab === "info" && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="relative">
                      <span className="absolute -left-10 top-0 text-6xl font-black text-slate-100 italic opacity-50">
                        “
                      </span>
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6">
                        Mô tả tài liệu
                      </h4>
                      <p className="text-slate-700 leading-[2] font-semibold text-xl italic border-l-8 border-emerald-500/20 pl-10">
                        {doc.description || "Không có mô tả cho tài liệu này."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
                        Tags Tri thức
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {doc.tags?.length > 0 ? (
                          doc.tags.map((tag) => (
                            <span
                              key={tag._id}
                              className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer uppercase tracking-tight shadow-sm"
                            >
                              #{tag.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 font-bold italic uppercase">
                            Chưa có tag nào
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                            B
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                              Đánh giá của bạn
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Hãy cho mọi người biết cảm nhận của bạn
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setUserRating(star)}
                              className="p-1 transition-transform active:scale-90"
                            >
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill={
                                  (hoverRating || userRating) >= star
                                    ? "#fbbf24"
                                    : "none"
                                }
                                stroke={
                                  (hoverRating || userRating) >= star
                                    ? "#fbbf24"
                                    : "#cbd5e1"
                                }
                                strokeWidth="2"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </button>
                          ))}
                          {userRating > 0 && (
                            <span className="ml-2 text-xs font-black text-amber-500">
                              {userRating}.0
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <textarea
                          placeholder="Chia sẻ cảm nghĩ của bạn về tài liệu này..."
                          value={commentInput || ""}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="w-full bg-white border-2 border-slate-100 rounded-3xl px-8 py-6 font-bold text-slate-700 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all resize-none shadow-sm placeholder:text-slate-300"
                          rows="4"
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-emerald-500 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? "Đang gửi..." : "Gửi thảo luận"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">
                        TẤT CẢ ĐÁNH GIÁ ({reviews.length})
                      </h4>

                      {reviews.length > 0 ? (
                        reviews.map((rev) => (
                          <div key={rev._id} className="flex gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-lg border border-slate-200 shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                              {rev.userId?.fullName?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 space-y-3 pb-8 border-b border-slate-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                    {rev.userId?.fullName}
                                  </h5>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <svg
                                        key={s}
                                        width="12"
                                        height="12"
                                        fill={
                                          s <= rev.rating
                                            ? "#fbbf24"
                                            : "#e2e8f0"
                                        }
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                  {new Date(rev.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                {rev.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                          <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">
                            Chưa có đánh giá nào cho tài liệu này
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-bl-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000 opacity-80"></div>

              <h3 className="text-2xl font-black mb-10 relative z-10 tracking-tighter uppercase italic">
                {doc.sourceType === "link" ? "XEM NGUỒN" : "TẢI VỀ MÁY"}
              </h3>

              <div className="space-y-4 mb-12 relative z-10">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:rotate-12 transition-transform">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                        LOẠI TÀI LIỆU
                      </p>
                      <p className="text-sm font-black tracking-tight uppercase">
                        {doc.materialType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                      NGUỒN
                    </p>
                    <p className="text-sm font-black tracking-tight uppercase">
                      {doc.sourceType}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 relative z-10"
              >
                <span>
                  {doc.sourceType === "link" ? "TRUY CẬP" : "TẢI NGAY"}
                </span>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="animate-bounce"
                >
                  <path
                    d="M12 5v14M5 12l7 7 7-7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {relatedDocs.length > 0 && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter italic flex items-center gap-3">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                  Tài liệu cùng chuyên mục
                </h3>
                <div className="space-y-6">
                  {relatedDocs.map((rd) => (
                    <Link
                      key={rd._id}
                      href={`/documents/${rd._id}`}
                      className="block group/item"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <div
                          className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-[10px] group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all`}
                        >
                          {rd.materialType === "video" ? (
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="m7 4 12 8-12 8V4z" strokeWidth="2.5" />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                strokeWidth="2.5"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-700 uppercase leading-tight line-clamp-2 group-hover/item:text-emerald-600 transition-colors">
                            {rd.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                              {rd.academicYear}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                              {rd.materialType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 border-b border-slate-100 -z-10 group-hover:bg-emerald-50 transition-colors"></div>

              <div className="relative inline-block mb-8 mt-4">
                <div className="w-28 h-28 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center text-4xl font-black text-slate-300 border-4 border-white overflow-hidden group-hover:rotate-6 transition-transform relative">
                  {doc.uploaderId?.avatar ? (
                    <Image
                      src={doc.uploaderId.avatar}
                      alt="avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    doc.uploaderId?.fullName?.charAt(0) || "U"
                  )}
                  <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-xl">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase italic">
                {doc.uploaderId?.fullName}
              </h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-10">
                Người đóng góp tri thức
              </p>

              <div className="grid grid-cols-1 gap-4 border-y border-slate-50 py-8 mb-10">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
                    EMAIL
                  </p>
                  <p className="text-sm font-black text-slate-800 truncate px-4">
                    {doc.uploaderId?.email}
                  </p>
                </div>
              </div>

              <button className="w-full py-5 rounded-2xl border-2 border-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm">
                XEM TRANG CÁ NHÂN
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
