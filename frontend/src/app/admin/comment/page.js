"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CommentAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { toast.error("Lỗi tải bình luận"); return; }
      const data = await res.json();
      if (!Array.isArray(data)) { toast.error("Lỗi tải bình luận"); return; }
      setComments(data);
    } catch {
      toast.error("Lỗi tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Xóa comment này?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/comments/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { toast.error("Xóa bình luận thất bại"); return; }
      toast.success("Xóa bình luận thành công!");
      fetchComments();
    } catch {
      toast.error("Xóa bình luận thất bại");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Bình luận</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Kiểm soát nội dung thảo luận trên hệ thống</p>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Nội dung</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Người đăng</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tài liệu</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff06]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-[13px] text-slate-500">Chưa có bình luận nào</p>
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c._id} className="hover:bg-[#ffffff04] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-slate-300 max-w-xs line-clamp-2">{c.content}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-slate-300">{c.userId?.fullName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-cyan-500/80 truncate max-w-[160px] inline-block">{c.materialId?.title}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-slate-600">
                        {new Date(c.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl ml-auto text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
                        title="Xóa bình luận"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && comments.length > 0 && (
          <div className="px-5 py-3 border-t border-[#ffffff08]">
            <p className="text-[11px] text-slate-600">{comments.length} bình luận</p>
          </div>
        )}
      </div>
    </div>
  );
}
