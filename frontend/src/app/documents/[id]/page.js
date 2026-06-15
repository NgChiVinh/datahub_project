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
import DocumentChat from "@/components/DocumentChat";
import DocumentQuiz from "@/components/DocumentQuiz";

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
  const [quizOpen, setQuizOpen] = useState(false);
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

  const handleDownload = () => {
    if (!doc?.fileUrl) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const a = document.createElement("a");
    a.href = `${apiBase}/api/materials/${params.id}/download`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Cập nhật UI count (backend đã tự tăng trong proxyDownload)
    setDoc((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        downloadCount: (prev.metrics?.downloadCount || 0) + 1,
      },
    }));
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
      const isOfficeFile = doc.fileUrl.match(/\.(docx|doc|pptx|ppt)$/i);
      // PDF: dùng trực tiếp (browser native renderer, không qua Google Docs Viewer vì Google cần fetch file từ R2 gây lỗi)
      // DOCX/PPTX: Microsoft Office Online Viewer
      const viewerUrl = isOfficeFile
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.fileUrl)}`
        : doc.fileUrl;
      
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
    <div className="min-h-screen bg-[#FAFAF8] pb-24 pt-20">

      {/* Sticky breadcrumb + actions */}
      <div className="bg-[#FAFAF8]/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-20 z-40">
        <div className="container mx-auto max-w-7xl px-4 lg:px-12 h-14 flex items-center justify-between gap-4">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors group shrink-0"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" className="group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Thư viện
          </Link>
          <p className="text-[11px] font-medium text-slate-500 truncate hidden md:block flex-1 text-center">
            {doc.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleLike} disabled={likePending} aria-label={isLiked ? "Bỏ thích" : "Thích"} aria-pressed={isLiked}
              className={`p-2.5 rounded-xl border transition-all active:scale-90 disabled:opacity-50 ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"}`}>
              <svg width="15" height="15" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button onClick={handleShare} aria-label="Chia sẻ"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-90">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button onClick={() => setIsCollectionModalOpen(true)} title="Lưu vào bộ sưu tập"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-90">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button onClick={() => setIsReportModalOpen(true)} aria-label="Báo cáo vi phạm"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-90">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 lg:px-12">

        {/* ── EDITORIAL MASTHEAD ── */}
        <div className="relative py-14 overflow-hidden">
          {/* Watermark type */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[clamp(100px,15vw,180px)] font-black text-slate-100 uppercase leading-none select-none pointer-events-none hidden lg:block" aria-hidden="true">
            {doc.materialType}
          </div>

          {/* Tag row */}
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            <span className="px-3.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              {doc.materialType}
            </span>
            {doc.categoryId?.name && (
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-200/60">
                {doc.categoryId.name}
              </span>
            )}
            {doc.academicYear && (
              <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                {doc.academicYear}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl xl:text-[3.75rem] font-bold text-slate-900 leading-[1.05] tracking-tight mb-10 max-w-3xl relative z-10">
            {doc.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                {doc.uploaderId?.fullName?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-bold text-slate-700">{doc.uploaderId?.fullName}</span>
            </div>
            <span className="w-px h-4 bg-slate-200 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <strong className="text-slate-900">{doc.metrics?.viewCount?.toLocaleString("vi-VN") || 0}</strong> xem
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" fill="#fbbf24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <strong className="text-slate-900">{doc.metrics?.averageRating?.toFixed(1) || "0.0"}</strong>
                <span className="text-slate-400">({doc.metrics?.reviewCount || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <strong className="text-slate-900">{doc.metrics?.downloadCount?.toLocaleString("vi-VN") || 0}</strong> tải
              </span>
              <span className="text-slate-300">·</span>
              <span>{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200/60 mb-12" />

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-12 items-start">

          {/* Left column */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Tab nav */}
            <div className="flex items-center gap-0 border-b border-slate-200/60 mb-8" role="tablist">
              {[
                { id: "preview", label: "Xem trước", icon: "eye" },
                { id: "info", label: "Chi tiết", icon: "info" },
                { id: "comments", label: "Thảo luận", icon: "message", count: reviews.length + comments.length },
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
                    className={`relative px-5 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors focus-visible:outline-none whitespace-nowrap ${isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[tab.icon]} />
                    </svg>
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`min-w-[16px] h-4 px-1 rounded-full text-[8px] flex items-center justify-center font-black ${isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="min-h-[400px]">
              {activeTab === "preview" && renderPreview()}

              {activeTab === "info" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.35em] mb-4">Mô tả tài liệu</p>
                    <p className="text-base text-slate-700 leading-relaxed font-medium border-l-[3px] border-emerald-500/30 pl-6">
                      {doc.description || "Không có mô tả cho tài liệu này."}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-4">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.tags?.length > 0 ? doc.tags.map((tag) => (
                        <span key={tag._id} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-default">
                          #{tag.name}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-400 font-bold italic">Chưa có tag nào</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Loại file", value: doc.materialType?.toUpperCase() },
                      { label: "Chuyên ngành", value: doc.majorId?.name },
                      { label: "Năm học", value: doc.academicYear },
                      { label: "Danh mục", value: doc.categoryId?.name },
                      { label: "Nguồn lưu trữ", value: doc.sourceType },
                      { label: "Ngày đăng", value: new Date(doc.createdAt).toLocaleDateString("vi-VN") },
                    ].filter(i => i.value).map(({ label, value }) => (
                      <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                        <p className="text-sm font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-12 animate-in fade-in duration-300">

                  {/* Review form */}
                  <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-sm font-black text-slate-800">Đánh giá tài liệu</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Chia sẻ trải nghiệm của bạn</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setUserRating(star)}
                            aria-label={`${star} sao`}
                            aria-pressed={userRating === star}
                            className="p-0.5 transition-transform hover:scale-110 active:scale-90">
                            <svg width="24" height="24" viewBox="0 0 24 24"
                              fill={(hoverRating || userRating) >= star ? "#fbbf24" : "none"}
                              stroke={(hoverRating || userRating) >= star ? "#fbbf24" : "#cbd5e1"}
                              strokeWidth="2">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Tài liệu này có hữu ích không? Hãy cho mọi người biết..."
                      value={commentInput || ""}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-300"
                      rows="3"
                    />
                    <div className="flex justify-end mt-4">
                      <button onClick={handleSubmitReview} disabled={isSubmitting}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </div>

                  {/* Reviews list */}
                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        {reviews.length} đánh giá từ cộng đồng
                      </p>
                      {reviews.map((rev) => (
                        <div key={rev._id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                {rev.userId?.fullName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{rev.userId?.fullName}</p>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  {[1,2,3,4,5].map((s) => (
                                    <svg key={s} width="9" height="9" viewBox="0 0 24 24" fill={s <= rev.rating ? "#fbbf24" : "#e2e8f0"}>
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(rev.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{rev.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"/></div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#FAFAF8] px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Hỏi đáp & Thảo luận</span>
                    </div>
                  </div>

                  {/* Comment form */}
                  <div id="comment-form" className="space-y-4">
                    {replyingTo && (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600">Trả lời <span className="font-black">{replyingTo.name}</span></p>
                        <button onClick={() => setReplyingTo(null)} className="text-[9px] font-bold text-slate-400 hover:text-red-500">Hủy</button>
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        placeholder="Đặt câu hỏi hoặc thảo luận về tài liệu này..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-16 text-sm font-medium text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-300"
                        rows="3"
                      />
                      <button onClick={handleSubmitComment} disabled={isSubmitting || !commentText.trim()} aria-label="Gửi bình luận"
                        className="absolute bottom-3 right-3 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                          <span className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="space-y-1 pt-2">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <CommentItem key={comment._id} comment={comment} onReply={handleReply} />
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chưa có thảo luận nào</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* RAG Chat */}
            <DocumentChat
              materialId={doc._id}
              hasContent={doc.hasContentText}
            />
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-5 lg:sticky lg:top-36 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">

            {/* Download card */}
            <div className="bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                  {doc.sourceType === "link" ? "NGUỒN LIÊN KẾT" : "FILE TÀI LIỆU"}
                </p>
                <p className="text-base font-black uppercase tracking-tight mb-5">
                  {doc.sourceType === "link" ? "Xem nguồn" : "Tải về máy"}
                </p>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-0.5">Loại file</p>
                    <p className="text-sm font-black uppercase">{doc.materialType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-0.5">Nguồn</p>
                    <p className="text-sm font-black uppercase">{doc.sourceType}</p>
                  </div>
                </div>
                <button onClick={handleDownload}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 group/dl">
                  {doc.sourceType === "link" ? "Truy cập ngay" : "Tải ngay"}
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover/dl:translate-y-0.5 transition-transform">
                    <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {doc?.hasContentText && (
                  <button
                    onClick={() => setQuizOpen(true)}
                    className="w-full mt-3 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    Kiểm tra kiến thức
                  </button>
                )}
              </div>
            </div>

            {/* Related docs */}
            {relatedDocs.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {relatedIsAI ? "Gợi ý AI" : "Cùng chuyên mục"}
                </p>
                <div className="space-y-0.5">
                  {relatedDocs.map((rd) => (
                    <Link key={rd._id} href={`/documents/${rd._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/rel">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-[8px] font-black text-slate-400 uppercase group-hover/rel:bg-emerald-500 group-hover/rel:text-white transition-all">
                        {rd.materialType?.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight group-hover/rel:text-emerald-600 transition-colors">
                          {rd.title}
                        </p>
                        {relatedIsAI && typeof rd.score === "number" && (
                          <p className="text-[9px] font-bold text-emerald-500 mt-0.5">{Math.round(rd.score * 100)}% liên quan</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-base overflow-hidden relative">
                    {doc.uploaderId?.avatar ? (
                      <Image src={doc.uploaderId.avatar} alt="avatar" fill className="object-cover" />
                    ) : (
                      doc.uploaderId?.fullName?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-emerald-500 flex items-center justify-center border-2 border-white">
                    <svg width="8" height="8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{doc.uploaderId?.fullName}</p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Người đóng góp</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Chuyên ngành</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{doc.majorId?.name || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ngày đăng</p>
                  <p className="text-xs font-bold text-slate-800">{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
              <Link
                href={`/documents?search=${encodeURIComponent(doc.uploaderId?.fullName || "")}`}
                className="block w-full py-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-center">
                Xem tài liệu cùng người đăng
              </Link>
            </div>

          </aside>
        </div>
      </div>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} materialId={params.id} />
      <AddToCollectionModal isOpen={isCollectionModalOpen} onClose={() => setIsCollectionModalOpen(false)} materialId={params.id} />
      <DocumentQuiz
        materialId={doc?._id}
        hasContent={doc?.hasContentText}
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
    </div>
  );
}
