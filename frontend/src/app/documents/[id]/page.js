"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import ReportModal from "@/components/ReportModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { getYoutubeId, getYoutubeEmbedUrl } from "@/lib/youtube";

const TAB_ICONS = {
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  message:
    "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
};


// Một bình luận (đệ quy cho phần trả lời). Đặt ngoài component cha để không bị
// tạo lại type mới mỗi render — nếu để bên trong, React remount cả cây comment
// mỗi lần state đổi, gây mất focus và giật.
function CommentItem({ comment, isReply = false, onReply }) {
  return (
    <div className={`flex gap-4 ${isReply ? "ml-12 mt-4" : "mt-8"}`}>
      <div
        className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-200 shrink-0`}
      >
        {comment.userId?.fullName?.charAt(0) || "U"}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
        <h5 className="text-xs font-bold text-slate-800">
          {comment.userId?.fullName}
        </h5>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <button
            onClick={() =>
              onReply({ id: comment._id, name: comment.userId?.fullName })
            }
            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            Trả lời
          </button>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {comment.content}
        </p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                isReply={true}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentDetailPage() {
  const params = useParams();
  const [doc, setDoc] = useState(null);
  const [relatedDocs, setRelatedDocs] = useState([]);
  const [relatedIsAI, setRelatedIsAI] = useState(false);
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [likePending, setLikePending] = useState(false);

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchDocData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Tài liệu là dữ liệu bắt buộc — nếu lỗi thì coi như cả trang lỗi.
        const docData = (await api.get(`/api/materials/${params.id}`)).data;
        setDoc(docData);

        // Các phần phụ (bình luận, đánh giá, liên quan) tải độc lập:
        // một phần lỗi không được làm hỏng phần còn lại.
        const [commentRes, reviewRes] = await Promise.allSettled([
          api.get(`/api/comments/material/${params.id}`),
          api.get(`/api/reviews/material/${params.id}`),
        ]);

        const commentData = commentRes.value?.data;
        const reviewData = reviewRes.value?.data;
        setComments(Array.isArray(commentData) ? commentData : []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);

        // Tài liệu liên quan: ưu tiên gợi ý AI (vector similarity),
        // fallback về cùng chuyên mục nếu tài liệu chưa có embedding.
        try {
          const similarJson = (
            await api.get(`/api/recommendations/similar/${params.id}?limit=5`)
          ).data;
          const aiDocs = Array.isArray(similarJson?.data) ? similarJson.data : [];

          if (aiDocs.length > 0) {
            setRelatedDocs(aiDocs);
            setRelatedIsAI(true);
          } else if (docData.categoryId?._id) {
            const relatedJson = (
              await api.get(
                `/api/materials?category=${docData.categoryId._id}&limit=6`,
              )
            ).data;
            const fallbackDocs = Array.isArray(relatedJson?.materials)
              ? relatedJson.materials
              : [];
            setRelatedDocs(
              fallbackDocs.filter((m) => m._id !== params.id).slice(0, 5),
            );
            setRelatedIsAI(false);
          }
        } catch (relatedErr) {
          console.error("Lỗi lấy tài liệu liên quan:", relatedErr);
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Không tìm thấy tài liệu!"
            : "Không tải được tài liệu. Vui lòng thử lại.",
        );
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
        await api.post(`/api/materials/${params.id}/download`);
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
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!commentInput.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/reviews`, {
        materialId: params.id,
        rating: userRating,
        content: commentInput,
      });

      toast.success("Cảm ơn bạn đã đánh giá tài liệu!");
      setCommentInput("");
      setUserRating(0);

      const [updatedReviews, updatedDoc] = await Promise.allSettled([
        api.get(`/api/reviews/material/${params.id}`),
        api.get(`/api/materials/${params.id}`),
      ]);
      if (updatedReviews.status === "fulfilled") {
        const data = updatedReviews.value.data;
        setReviews(Array.isArray(data) ? data : []);
      }
      // Cập nhật lại tài liệu để lấy rating trung bình mới
      if (updatedDoc.status === "fulfilled") {
        setDoc(updatedDoc.value.data);
      }
    } catch (err) {
      console.error("Review error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      toast.error("Vui lòng đăng nhập để thích tài liệu!");
      return;
    }
    if (likePending) return; // chặn double-click làm lệch trạng thái/đếm

    const currentUser = JSON.parse(userData);

    try {
      setLikePending(true);
      const { data } = await api.post(`/api/materials/${params.id}/like`);
      setIsLiked(data.isLiked);
      if (data.isLiked) {
        toast.success("Đã thêm vào danh sách yêu thích");
      }
      setDoc((prev) => {
        const currentLikes = prev.likes || [];
        const updatedLikes = data.isLiked
          ? [...currentLikes, currentUser._id]
          : currentLikes.filter((id) => id !== currentUser._id);

        return { ...prev, likes: updatedLikes };
      });
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLikePending(false);
    }
  };

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/comments`, {
        materialId: params.id,
        content: commentText,
        parentId: replyingTo?.id || null,
      });

      toast.success("Đã gửi bình luận");
      setCommentText("");
      setReplyingTo(null);
      try {
        const { data } = await api.get(
          `/api/comments/material/${params.id}`,
        );
        setComments(Array.isArray(data) ? data : []);
      } catch {
        // refetch lỗi không sao — bình luận đã gửi thành công
      }
    } catch (err) {
      console.error("Comment error:", err);
      toast.error("Gửi bình luận thất bại");
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

  const handleReply = ({ id, name }) => {
    setReplyingTo({ id, name });
    setActiveTab("comments");
    const form = document.getElementById("comment-form");
    if (form) {
      window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    // Web Share API trên mobile; fallback copy link trên desktop.
    if (navigator.share) {
      try {
        await navigator.share({ title: doc?.title, url });
      } catch {
        // người dùng hủy hộp thoại share — bỏ qua
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết tài liệu");
    } catch {
      toast.error("Không sao chép được liên kết");
    }
  };

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
      const ytId = getYoutubeId(doc.fileUrl);

      if (ytId) {
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto aspect-video w-full bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden relative">
              <iframe
                src={getYoutubeEmbedUrl(doc.fileUrl)}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="max-w-3xl mx-auto aspect-video w-full bg-slate-100 rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-center space-y-6 px-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto text-emerald-500 group-hover:scale-110 transition-transform">
                <svg
                  width="32"
                  height="32"
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
                <h4 className="text-lg font-black text-slate-800 mb-2 uppercase italic">
                  Tài liệu từ nguồn bên ngoài
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                  Tài liệu này được lưu trữ tại một trang web khác. Nhấn nút bên
                  dưới để truy cập.
                </p>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-primary hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Mở liên kết gốc
                <svg
                  width="14"
                  height="14"
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

    if (["pdf", "docx", "pptx"].includes(doc.materialType)) {
      // Ưu tiên Microsoft Office Online Viewer cho các định dạng Word/PPT vì độ ổn định cao hơn.
      // PDF vẫn sử dụng Google Docs Viewer do Microsoft không hỗ trợ định dạng này.
      const isOfficeFile = doc.fileUrl.match(/\.(docx|doc|pptx|ppt)$/i);
      const viewerUrl = isOfficeFile
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.fileUrl)}`
        : `https://docs.google.com/viewer?url=${encodeURIComponent(doc.fileUrl)}&embedded=true`;
      
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="max-w-[760px] mx-auto w-full aspect-[3/4] max-h-[800px] bg-slate-100 rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden relative group">
            <iframe
              src={viewerUrl}
              className="w-full h-full border-none"
              title={doc.title}
            ></iframe>
            
            {/* Overlay for actions when not interacting with iframe */}
            <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={handleDownload}
                className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl hover:bg-emerald-500 hover:text-white transition-all pointer-events-auto"
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

            {/* Hint overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900/80 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Đang xem bản xem trước trực tuyến
            </div>
          </div>
        </div>
      );
    }

    if (doc.materialType === "video") {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="max-w-4xl mx-auto aspect-video w-full bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden relative group">
            <video src={doc.fileUrl} controls className="w-full h-full"></video>
          </div>
        </div>
      );
    }


    // Default for other types (zip, etc.)
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
                Định dạng này cần tải về
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-xs mx-auto">
                Tệp {doc.materialType?.toUpperCase()} không hỗ trợ xem trực tiếp
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
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
      <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-pulse">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 space-y-8">
                <div className="flex gap-3">
                  <div className="h-8 w-24 rounded-2xl bg-slate-100"></div>
                  <div className="h-8 w-28 rounded-2xl bg-slate-100"></div>
                  <div className="h-8 w-20 rounded-2xl bg-slate-100"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-10 w-3/4 rounded-2xl bg-slate-100"></div>
                  <div className="h-10 w-1/2 rounded-2xl bg-slate-100"></div>
                </div>
                <div className="flex gap-10 border-t border-slate-50 pt-10">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-5 w-20 rounded-lg bg-slate-100"></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14">
                <div className="aspect-[3/4] max-h-[800px] w-full max-w-[760px] mx-auto rounded-[2.5rem] bg-slate-100"></div>
              </div>
            </div>
            <aside className="space-y-12">
              <div className="bg-slate-900/90 rounded-[3rem] p-10 space-y-8">
                <div className="h-7 w-32 rounded-xl bg-white/10"></div>
                <div className="h-20 w-full rounded-3xl bg-white/10"></div>
                <div className="h-16 w-full rounded-3xl bg-emerald-500/30"></div>
              </div>
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 space-y-6">
                <div className="h-6 w-40 rounded-lg bg-slate-100"></div>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 w-full rounded-2xl bg-slate-50"></div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    );

  if (error || !doc)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-10 md:p-14 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-md">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8">
            <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase italic">
            Ối! Có lỗi xảy ra
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            {error || "Tài liệu không tồn tại."}
          </p>
          <Link
            href="/documents"
            className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
          >
            Quay lại Thư viện
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
      {/* Top Breadcrumb & Actions */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-20 z-40 transition-all duration-300">
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
              disabled={likePending}
              aria-label={isLiked ? "Bỏ thích tài liệu" : "Thích tài liệu"}
              aria-pressed={isLiked}
              className={`p-3 rounded-2xl border transition-all duration-300 active:scale-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 ${isLiked ? "bg-red-50 border-red-100 text-red-500 shadow-lg shadow-red-500/10" : "bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100"}`}
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
            <button
              onClick={handleShare}
              aria-label="Chia sẻ tài liệu"
              title="Chia sẻ"
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                ></path>
              </svg>
            </button>
            <button 
              onClick={() => setIsCollectionModalOpen(true)}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all active:scale-90"
              title="Thêm vào bộ sưu tập"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              aria-label="Báo cáo vi phạm"
              title="Báo cáo vi phạm"
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-10 relative z-10">
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
              <div className="flex border-b border-slate-50 px-10 pt-8 gap-4 overflow-x-auto no-scrollbar" role="tablist">
                {[
                  { id: "preview", label: "XEM TRƯỚC", icon: "eye" },
                  { id: "info", label: "CHI TIẾT", icon: "info" },
                  {
                    id: "comments",
                    label: "THẢO LUẬN",
                    icon: "message",
                    count: reviews.length + comments.length,
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-controls={`tabpanel-${tab.id}`}
                      aria-selected={isActive}
                      className={`px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:text-emerald-600 ${isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d={TAB_ICONS[tab.icon]}
                        />
                      </svg>
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] flex items-center justify-center transition-colors ${isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                        >
                          {tab.count}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_-4px_10px_rgba(16,185,129,0.3)]"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                className="p-10 md:p-14 min-h-[500px]"
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
              >
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
                      <p className="text-slate-700 leading-relaxed font-medium text-lg border-l-4 border-emerald-500/30 pl-8">
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
                  <div className="space-y-16 animate-in fade-in duration-500">
                    {/* Phần Đánh giá (Reviews) */}
                    <div className="space-y-10">
                      <div className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                              ★
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                Đánh giá tài liệu
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Chia sẻ trải nghiệm và số sao của bạn
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
                          </div>
                        </div>

                        <div className="space-y-6">
                          <textarea
                            placeholder="Tài liệu này có hữu ích không? Hãy cho mọi người biết..."
                            value={commentInput || ""}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-3xl px-8 py-6 font-bold text-slate-700 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all resize-none shadow-sm placeholder:text-slate-300"
                            rows="3"
                          ></textarea>
                          <div className="flex justify-end">
                            <button
                              onClick={handleSubmitReview}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-primary hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                            >
                              {isSubmitting && (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                              )}
                              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                          ĐÁNH GIÁ TỪ CỘNG ĐỒNG ({reviews.length})
                        </h4>

                        {reviews.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6">
                            {reviews.map((rev) => (
                              <div key={rev._id} className="p-8 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm">
                                      {rev.userId?.fullName?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-800">
                                        {rev.userId?.fullName}
                                      </h5>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <svg
                                            key={s}
                                            width="10"
                                            height="10"
                                            fill={s <= rev.rating ? "#fbbf24" : "#e2e8f0"}
                                            viewBox="0 0 24 24"
                                          >
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                          </svg>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                                    {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                  {rev.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                              Chưa có đánh giá nào
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dải phân cách */}
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Hỏi đáp & Thảo luận</span>
                      </div>
                    </div>

                    {/* Phần Bình luận (Comments) */}
                    <div id="comment-form" className="space-y-10">
                      <div className="space-y-6">
                        {replyingTo && (
                          <div className="flex items-center justify-between px-6 py-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-in slide-in-from-top-2">
                            <p className="text-[10px] font-black text-emerald-600 uppercase">
                              Đang trả lời: <span className="italic">{replyingTo.name}</span>
                            </p>
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                        <div className="relative">
                          <textarea
                            placeholder="Đặt câu hỏi hoặc thảo luận về tài liệu này..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-3xl px-8 py-6 font-bold text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none shadow-sm placeholder:text-slate-300"
                            rows="3"
                          ></textarea>
                          <button
                            onClick={handleSubmitComment}
                            disabled={isSubmitting || !commentText.trim()}
                            aria-label="Gửi bình luận"
                            className="absolute bottom-4 right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                          >
                            {isSubmitting ? (
                              <span className="block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                            ) : (
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {comments.length > 0 ? (
                          comments.map((comment) => (
                            <CommentItem
                              key={comment._id}
                              comment={comment}
                              onReply={handleReply}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                              Chưa có thảo luận nào
                            </p>
                          </div>
                        )}
                      </div>
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
                className="w-full bg-primary text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-emerald-500/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 relative z-10"
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
                  {relatedIsAI ? "Tài liệu liên quan (AI)" : "Tài liệu cùng chuyên mục"}
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
                          <p className="text-sm font-bold text-slate-700 leading-tight line-clamp-2 group-hover/item:text-emerald-600 transition-colors">
                            {rd.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {relatedIsAI ? (
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                {Math.round((rd.score || 0) * 100)}% liên quan
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {rd.academicYear}
                              </span>
                            )}
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

              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                {doc.uploaderId?.fullName}
              </h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-10">
                Người đóng góp tri thức
              </p>

              <div className="grid grid-cols-1 gap-4 border-y border-slate-50 py-8 mb-10">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
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
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        materialId={params.id}
      />
      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        materialId={params.id}
      />
    </div>
  );
}
