"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (params.id) {
      fetchCollection();
    }
  }, [params.id]);

  const fetchCollection = async () => {
    const token = localStorage.getItem("token");
    
    try {
      setIsLoading(true);
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/collections/${params.id}`, {
        headers,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           throw new Error("Bạn không có quyền xem bộ sưu tập này, hoặc nó đã được đặt ở chế độ riêng tư.");
        }
        throw new Error("Không thể tải bộ sưu tập");
      }

      const data = await res.json();
      setCollection(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMaterial = async (materialId) => {
    if (!confirm("Xóa tài liệu khỏi bộ sưu tập?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/collections/${params.id}/materials`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ materialId }),
      });

      if (res.ok) {
        toast.success("Đã xóa tài liệu");
        setCollection(prev => ({
          ...prev,
          materialIds: prev.materialIds.filter(m => m._id !== materialId)
        }));
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi server");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative flex justify-center items-center w-20 h-20">
           <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-32 pt-28 selection:bg-blue-200">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 font-bold text-sm transition-all shadow-sm"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transform group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Premium Header Card */}
        <div className="bg-slate-950 rounded-[3rem] p-1 shadow-2xl shadow-blue-900/10 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20"></div>
          
          <div className="bg-slate-950 rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-white/10 backdrop-blur-2xl">
            {/* Glowing Decorative Backgrounds */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-600/20 to-blue-600/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-8">
                  <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 text-blue-400 rounded-xl text-xs font-black tracking-widest uppercase">
                    Bộ sưu tập
                  </span>
                  <span className={`px-4 py-1.5 border rounded-xl text-xs font-black tracking-widest uppercase ${collection.isPublic ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    {collection.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-[1.15] max-w-4xl">
                {collection.name}
              </h1>
              
              <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
                {collection.description || "Không có mô tả cho bộ sưu tập này."}
              </p>
              
              <div className="inline-flex flex-wrap justify-center items-center gap-8 md:gap-16 py-6 px-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Người tạo</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-inner">
                          {collection.userId?.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <p className="text-base font-bold text-white">{collection.userId?.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-px h-12 bg-white/10"></div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tài liệu</p>
                    <p className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
                        {collection.materialIds?.length || 0}
                        <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Mục</span>
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách tài liệu</h2>
          </div>

          {collection.materialIds?.length > 0 ? (
            <div className="space-y-4">
              {collection.materialIds.map((doc) => (
                <div
                  key={doc._id}
                  className="group relative bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="flex items-start md:items-center gap-5 flex-1 w-full relative z-10 pl-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shrink-0 border border-white shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors tracking-tight">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <span className="px-3 py-1 bg-slate-100/80 rounded-lg text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                          {doc.materialType}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg">
                           <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           <span className="font-bold text-slate-700">{doc.metrics?.viewCount || 0}</span> lượt xem
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 justify-end pt-4 md:pt-0 border-t border-slate-100 md:border-t-0 relative z-10">
                    <Link
                      href={`/documents/${doc._id}`}
                      className="flex-1 md:flex-none text-center px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10 hover:shadow-blue-600/30"
                    >
                      Mở tài liệu
                    </Link>
                    
                    {user && collection.userId && user._id === collection.userId._id && (
                      <button
                        onClick={() => handleRemoveMaterial(doc._id)}
                        className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl transition-all shadow-sm group/btn"
                        title="Xóa khỏi bộ sưu tập"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover/btn:scale-110 transition-transform">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-inner">
                   <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Chưa có tài liệu</h3>
                <p className="text-slate-500 font-medium mb-8">Bộ sưu tập này hiện tại đang trống.</p>
                <Link href="/documents" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/30 group">
                   Khám phá tài liệu ngay
                   <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transform group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
