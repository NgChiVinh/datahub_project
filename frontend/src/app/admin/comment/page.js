"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTableWrapper from "@/components/admin/AdminTableWrapper";

export default function CommentAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    } catch { toast.error("Lỗi tải bình luận"); }
    finally { setLoading(false); }
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
    } catch { toast.error("Xóa bình luận thất bại"); }
  };

  return (
    <div className="space-y-7 pb-10">
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
          <span className="w-6 h-[2px] bg-emerald-600"></span>
          Quản lý
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bình luận</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Kiểm soát nội dung thảo luận trên hệ thống</p>
      </div>

      <AdminTableWrapper>
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{comments.length} bình luận</p>
        </div>

        <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung bình luận</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người đăng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài liệu</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <p className="text-sm font-semibold text-slate-400 italic">Chưa có bình luận nào</p>
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 font-medium max-w-xs line-clamp-2">{c.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 flex-shrink-0">
                          {c.userId?.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{c.userId?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-primary truncate max-w-[160px] inline-block">{c.materialId?.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(c.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa bình luận"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </AdminTableWrapper>
    </div>
  );
}
