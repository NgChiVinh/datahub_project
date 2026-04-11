"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AISuggestPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Giả lập AI đang phân tích dữ liệu trong 2 giây
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 animate-pulse">AI đang phân tích lộ trình của bạn...</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">Dựa trên lịch sử học tập và sở thích của bạn</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 py-16 lg:py-24">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Cá nhân hóa bởi trí tuệ nhân tạo
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 uppercase tracking-tighter">
              Lộ trình học tập <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Dành riêng cho bạn</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Dựa trên các tài liệu bạn đã xem và bài tập bạn quan tâm, AI đã tổng hợp một lộ trình tối ưu để giúp bạn làm chủ kiến thức nhanh nhất.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-8 lg:-mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
                Lộ trình đề xuất tháng 04/2026
              </h3>
              
              <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { step: "01", title: "Nền tảng cấu trúc dữ liệu", status: "Hoàn thành", color: "bg-emerald-500" },
                  { step: "02", title: "Thuật toán tìm kiếm nâng cao", status: "Đang học", color: "bg-blue-500", active: true },
                  { step: "03", title: "Ứng dụng AI vào Web App", status: "Sắp tới", color: "bg-slate-200" },
                  { step: "04", title: "Đồ án cuối kỳ thực chiến", status: "Sắp tới", color: "bg-slate-200" }
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-12 group">
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg ${item.color} ${item.active ? "ring-4 ring-blue-100 animate-pulse" : ""}`}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black uppercase tracking-tight mb-1 transition-colors ${item.active ? "text-blue-600" : "text-slate-800"}`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Recommended Docs */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-emerald-400">Tài liệu khuyên đọc</h3>
              <div className="space-y-4">
                {[
                  "Cẩm nang thuật toán 2024",
                  "Source Code quản lý sinh viên",
                  "Slide bài giảng AI nâng cao"
                ].map((doc, i) => (
                  <Link href="#" key={i} className="block p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all">
                    <p className="text-sm font-black tracking-tight mb-1">{doc}</p>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Xem ngay →</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">Tại sao AI chọn lộ trình này?</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Hệ thống nhận thấy bạn thường xuyên tìm kiếm về <span className="text-emerald-600 font-black">"Thuật toán"</span> và đã xem 5 video về <span className="text-blue-600 font-black">"Next.js"</span> trong tuần qua.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
