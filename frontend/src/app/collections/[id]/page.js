"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/collections/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("Bạn không có quyền xem bộ sưu tập này");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
      <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-10">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại Hồ sơ
          </Link>
          
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-bl-[8rem] -mr-20 -mt-20"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      Bộ sưu tập
                   </span>
                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${collection.isPublic ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {collection.isPublic ? 'Công khai' : 'Riêng tư'}
                   </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
                  {collection.name}
                </h1>
                
                <p className="text-slate-500 font-medium text-lg max-w-2xl">
                  {collection.description || "Không có mô tả"}
                </p>
                
                <div className="flex items-center gap-8 mt-10 pt-10 border-t border-slate-50">
                   <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Số lượng</p>
                      <p className="text-xl font-black text-slate-800">{collection.materialIds?.length || 0} tài liệu</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Người tạo</p>
                      <p className="text-xl font-black text-slate-800">{collection.userId?.fullName}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Material List */}
        <div className="space-y-6">
          {collection.materialIds?.length > 0 ? (
            collection.materialIds.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase italic line-clamp-1">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                      <span>{doc.materialType}</span>
                      <span>{doc.metrics?.viewCount || 0} Lượt xem</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/documents/${doc._id}`}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-slate-900/10"
                  >
                    Xem chi tiết
                  </Link>
                  
                  <button
                    onClick={() => handleRemoveMaterial(doc._id)}
                    className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    title="Xóa khỏi bộ sưu tập"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black text-xs uppercase tracking-[0.2em] mb-4">Bộ sưu tập này chưa có tài liệu nào</p>
              <Link href="/documents" className="text-emerald-500 font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">
                 Khám phá tài liệu ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
