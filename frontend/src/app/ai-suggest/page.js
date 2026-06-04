"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getTypeStyles = (type) => {
  switch (type) {
    case "pdf": return "from-rose-50 to-rose-100/50 text-rose-600";
    case "docx": return "from-blue-50 to-blue-100/50 text-blue-600";
    case "pptx": return "from-orange-50 to-orange-100/50 text-orange-600";
    case "video": return "from-purple-50 to-purple-100/50 text-purple-600";
    case "zip": return "from-slate-100 to-slate-200/50 text-slate-700";
    default: return "from-slate-50 to-slate-100/50 text-slate-500";
  }
};

export default function AISuggestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(true);
  const [items, setItems] = useState([]);
  const [isColdStart, setIsColdStart] = useState(false);
  const [basedOn, setBasedOn] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthed(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${API}/api/recommendations/for-you?limit=12`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setIsAuthed(false);
          return;
        }

        const json = await res.json();
        if (json?.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
          setIsColdStart(!!json.isColdStart);
          setBasedOn(json.basedOn || null);
        } else {
          setError(json?.message || "Không lấy được gợi ý");
        }
      } catch (err) {
        console.error("Lỗi lấy gợi ý:", err);
        setError("Lỗi kết nối server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
          <svg className="absolute inset-0 m-auto text-emerald-500 animate-bounce" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 animate-pulse">AI đang phân tích sở thích của bạn...</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">Dựa trên các tài liệu bạn đã xem và tải</p>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthed) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-3">Đăng nhập để nhận gợi ý</h2>
        <p className="text-slate-500 text-sm font-medium max-w-md mb-8">
          AI cần biết bạn đã xem những tài liệu nào để đề xuất nội dung phù hợp nhất với bạn.
        </p>
        <Link href="/login" className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all active:scale-95">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 py-16 lg:py-20">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Cá nhân hóa bởi trí tuệ nhân tạo
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
              Gợi ý cho bạn
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              {isColdStart ? (
                <>Đây là những tài liệu <span className="text-emerald-600 font-black">phổ biến nhất</span> trên hệ thống. Hãy xem và tải vài tài liệu để AI hiểu bạn hơn.</>
              ) : basedOn ? (
                <>Vì bạn đã quan tâm đến <span className="text-emerald-600 font-black">&ldquo;{basedOn}&rdquo;</span>, AI gợi ý những tài liệu liên quan dưới đây.</>
              ) : (
                <>Dựa trên các tài liệu bạn đã xem và tải gần đây.</>
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {error ? (
          <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Chưa có gợi ý nào</p>
            <Link href="/documents" className="text-xs font-bold text-emerald-500 hover:underline">Khám phá thư viện tài liệu</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
                {isColdStart ? "Tài liệu phổ biến" : `Dựa trên lịch sử của bạn (${items.length})`}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/documents/${doc._id}`}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br transition-transform duration-500 group-hover:scale-105 ${getTypeStyles(doc.materialType)}`}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{doc.materialType}</span>
                    </div>
                    {isColdStart ? (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-sm text-[9px] font-black uppercase tracking-widest">Phổ biến</span>
                      </div>
                    ) : typeof doc.score === "number" && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-sm text-[9px] font-black uppercase tracking-widest">
                          {Math.round(doc.score * 100)}% liên quan
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 truncate">
                      {doc.categoryId?.name || "Tài liệu"}
                    </p>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors mb-4">
                      {doc.title}
                    </h3>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                          {doc.uploaderId?.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{doc.uploaderId?.fullName || "Ẩn danh"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="text-[11px] font-bold text-slate-900">{doc.metrics?.viewCount || 0}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Xem</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
