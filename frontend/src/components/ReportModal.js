"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ReportModal({ isOpen, onClose, materialId }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện báo cáo");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId,
          reason,
        }),
      });

      if (res.ok) {
        toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét nội dung này sớm nhất có thể.");
        onClose();
        setReason("");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gửi báo cáo thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Báo cáo <span className="text-primary">Vi phạm</span>
            </h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lý do báo cáo</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Nội dung không chính xác, vi phạm bản quyền, nội dung nhạy cảm..."
                rows="5"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-700 font-bold text-sm resize-none"
                required
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-red-500 hover:shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo ngay"}
              </button>
            </div>
            
            <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">
              Đội ngũ quản trị sẽ xem xét báo cáo này trong vòng 24h
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
