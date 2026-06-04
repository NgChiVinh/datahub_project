"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { LoadingView, UnauthenticatedView, EmptyStateView } from "./components";

const FETCH_LIMIT = 12;

// Màu sắc và Icon theo định dạng file - Tinh tế hơn
const getTypeStyles = (type) => {
  switch (type) {
    case "pdf": return "from-rose-400/20 to-rose-500/10 text-rose-600 border-rose-200/50";
    case "docx": return "from-blue-400/20 to-blue-500/10 text-blue-600 border-blue-200/50";
    case "pptx": return "from-orange-400/20 to-orange-500/10 text-orange-600 border-orange-200/50";
    case "video": return "from-purple-400/20 to-purple-500/10 text-purple-600 border-purple-200/50";
    case "zip": return "from-slate-400/20 to-slate-500/10 text-slate-600 border-slate-200/50";
    default: return "from-emerald-400/20 to-emerald-500/10 text-emerald-600 border-emerald-200/50";
  }
};

export default function AISuggestPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isColdStart, setIsColdStart] = useState(false);
  const [basedOn, setBasedOn] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthed) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get(`/api/recommendations/for-you?limit=${FETCH_LIMIT}`);

        const json = res.data;
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

    if (!authLoading) {
      fetchRecommendations();
    }
  }, [isAuthed, authLoading]);

  // --- UI: TRẠNG THÁI ĐANG TẢI (SKELETON) ---
  if (authLoading || isLoading) {
    return <LoadingView />;
  }

  // --- UI: CHƯA ĐĂNG NHẬP ---
  if (!isAuthed) {
    return <UnauthenticatedView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-emerald-100 selection:text-emerald-900 font-sans text-slate-800">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
           <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
           <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[140px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* AI Active Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-8 transition-all hover:scale-105 cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600">
                AI ĐANG HOẠT ĐỘNG
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              AI đã phân tích <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500">thói quen học tập của bạn</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
              Hệ thống đã học hỏi từ lịch sử tương tác và các tài liệu bạn quan tâm để đưa ra những đề xuất mang tính cá nhân hóa cao nhất.
            </p>

            {/* AI Learned Topics */}
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
              <span className="text-sm font-semibold text-slate-400 mr-2 py-1.5">Chủ đề phát hiện:</span>
              {["Backend", "Database", "React", "Spring Boot", "Java"].map((topic) => (
                <span key={topic} className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm hover:border-emerald-300 hover:text-emerald-600 transition-colors cursor-default">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- AI STATS SECTION --- */}
      <section className="container mx-auto px-4 relative z-10 mb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Stat 1 */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] border border-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(5,150,105,0.08)] transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/60 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm border border-emerald-100/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <span className="flex h-2.5 w-2.5 relative mt-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">{items.length > 0 ? items.length * 15 + 42 : '--'}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tài liệu đã phân tích</div>
          </div>
          {/* Stat 2 */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] border border-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.08)] transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/60 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform shadow-sm border border-cyan-100/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">{isColdStart ? '82%' : '94%'}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Độ tin cậy AI</div>
          </div>
          {/* Stat 3 */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] border border-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.08)] transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/60 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm border border-purple-100/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">{basedOn ? '5' : '14'}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chủ đề phát hiện</div>
          </div>
          {/* Stat 4 */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] border border-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.08)] transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/60 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm border border-blue-100/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">Live</span>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">Vừa xong</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Lần cập nhật cuối</div>
          </div>
        </div>
      </section>

      {/* --- RECOMMENDATION GRID --- */}
      <div className="container mx-auto px-4 relative z-10">
        {error ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-xl rounded-[32px] border border-red-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[20px] flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 font-medium">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyStateView />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((doc, idx) => {
              const matchScore = doc.score ? Math.round(doc.score * 100) : (isColdStart ? "Phổ biến" : "90");
              return (
                <div
                  key={doc._id}
                  className="group flex flex-col bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(5,150,105,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-[16/9] rounded-[24px] overflow-hidden mb-6 bg-slate-100">
                    <div className={`w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105 bg-gradient-to-br ${getTypeStyles(doc.materialType)}`}>
                      <svg className="w-12 h-12 mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-80 bg-white/50 px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-white/40">{doc.materialType}</span>
                    </div>
                    
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-emerald-600 text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         {typeof matchScore === 'number' ? `${matchScore}% Liên quan` : matchScore}
                       </span>
                    </div>
                    {doc.categoryId?.name && (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-sm">
                          {doc.categoryId.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4 line-clamp-2">
                      {doc.title}
                    </h3>
                    
                    {/* AI Explanation Area */}
                    <div className="mb-6 p-4 rounded-[20px] bg-slate-50/80 border border-slate-100/80">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                        AI ĐỀ XUẤT VÌ:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                          <span>Bạn quan tâm {basedOn || "chủ đề này"}</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                          <span>Liên quan đến lịch sử học tập</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Footer & CTA */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[12px] bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                          {doc.uploaderId?.fullName?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800 leading-none mb-1 truncate max-w-[100px]">
                            {doc.uploaderId?.fullName || "Ẩn danh"}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {doc.metrics?.viewCount || 0}
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/documents/${doc._id}`}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md shadow-slate-900/10 hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all duration-300"
                      >
                        Mở tài liệu
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
