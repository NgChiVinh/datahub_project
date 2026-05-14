"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AddToCollectionModal({ isOpen, onClose, materialId }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserCollections();
    }
  }, [isOpen]);

  const fetchUserCollections = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return;
    
    const user = JSON.parse(userStr);
    if (!user._id) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections?userId=${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCollections(data || []);
      }
    } catch (err) {
      console.error("Lỗi lấy bộ sưu tập:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${collectionId}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ materialId }),
      });

      if (res.ok) {
        toast.success("Đã thêm vào bộ sưu tập!");
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi thêm");
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
              Thêm vào <span className="text-emerald-500">Bộ sưu tập</span>
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

          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : collections.length > 0 ? (
              collections.map((col) => (
                <button
                  key={col._id}
                  onClick={() => handleAddToCollection(col._id)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-2xl transition-all group"
                >
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800 uppercase italic group-hover:text-emerald-600 transition-colors">{col.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{col.materialIds?.length || 0} tài liệu</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Chưa có bộ sưu tập nào</p>
                <Link 
                  href="/profile" 
                  className="text-[9px] font-black text-emerald-500 uppercase tracking-widest underline decoration-2 underline-offset-4"
                >
                  Tạo bộ sưu tập tại trang cá nhân
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <button
              onClick={onClose}
              className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
