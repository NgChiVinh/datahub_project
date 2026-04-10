"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { CATEGORIES, FEATURED_DOCUMENTS } from "@/data/mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "Tất cả", icon: "square" },
    { id: "video", label: "Video bài giảng", icon: "play" },
    { id: "doc", label: "Tài liệu PDF", icon: "file-text" },
    { id: "exercise", label: "Bài tập & Code", icon: "code" },
  ];

  const filteredDocuments = useMemo(() => {
    let docs = FEATURED_DOCUMENTS;
    
    if (searchQuery.trim()) {
      docs = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "all") {
      docs = docs.filter((doc) => doc.type === activeFilter);
    }

    return docs;
  }, [searchQuery, activeFilter]);

  return (
    <div className="bg-white font-sans text-slate-900">
      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[810px] w-full flex items-center justify-center overflow-hidden py-40">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/banner_datahub.jpg" 
              alt="Banner DataHub" 
              fill
              className="object-cover"
              priority
            />
            {/* Lớp phủ tối ưu hơn để làm nổi bật nội dung mà vẫn thấy rõ banner */}
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl text-center text-white">
              <h1 className="text-5xl font-black leading-[1.3] tracking-tight lg:text-7xl mb-10 drop-shadow-2xl uppercase">
                TRẠM TRI THỨC <br />
                <span className="inline-block py-2 bg-gradient-to-r from-emerald-300 via-white to-emerald-200 bg-clip-text text-transparent">
                  CỘNG ĐỒNG IT
                </span>
              </h1>
              
              <p className="mt-8 text-xl leading-relaxed text-slate-50 font-medium px-4 max-w-3xl mx-auto opacity-100 drop-shadow-lg tracking-wide">
                Kho tàng tri thức số, kết hợp AI thông minh giúp định hướng tài liệu chuẩn xác cho cộng đồng IT Văn Lang.
              </p>

              {/* Compact Search Bar */}
              <div className="mt-10 w-full max-w-2xl mx-auto px-4 group">
                <div className="relative flex items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl p-1.5 shadow-2xl transition-all duration-500 focus-within:bg-white focus-within:ring-8 focus-within:ring-primary/5">
                  <div className="flex flex-1 items-center gap-4 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm tài liệu, bài giảng..." 
                      className="w-full bg-transparent py-3 text-base font-bold text-white outline-none placeholder:text-slate-300 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="rounded-xl bg-primary px-8 py-3.5 text-[10px] font-black text-white shadow-xl hover:bg-emerald-800 active:scale-95 transition-all">
                     TÌM KIẾM
                  </button>
                </div>

                {/* Trending Tags - Smaller */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  <span className="opacity-50">Xu hướng:</span>
                  <button onClick={() => setSearchQuery("Python")} className="hover:text-emerald-300 transition-colors">#PYTHON</button>
                  <button onClick={() => setSearchQuery("DSA")} className="hover:text-emerald-300 transition-colors">#DSA</button>
                  <button onClick={() => setSearchQuery("Next.js")} className="hover:text-emerald-300 transition-colors">#NEXTJS</button>
                </div>
              </div>
            </div>

            {/* VLU Logo at Bottom Right of the banner container */}
            <div className="absolute bottom-[-140px] right-4 lg:right-0 opacity-80">
              <Image 
                src="/images/logo_vlu.png" 
                alt="Logo VLU" 
                width={100} 
                height={40} 
                className="h-auto w-24 lg:w-32 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* --- MAIN CONTENT / FILTERS --- */}
        <section className="bg-white py-24 relative border-t border-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="animate-fade-in-up">
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-3 block">Knowledge Base</span>
                <h2 className="flex items-center gap-4 text-4xl font-black tracking-tight text-slate-900">
                  {searchQuery ? `Kết quả cho "${searchQuery}"` : "Dành riêng cho bạn"}
                  <div className="h-2 w-2 rounded-full bg-highlight animate-pulse"></div>
                </h2>
              </div>
              
              {/* Quick Filters - Chips Style */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all whitespace-nowrap border-2 ${
                      activeFilter === f.id
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "bg-white border-slate-100 text-slate-500 hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((item, idx) => (
                  <div key={item.id} className="group flex flex-col animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] bg-slate-100 mb-6 shadow-2xl shadow-slate-200/50 group-hover:shadow-primary/20 transition-all duration-500 group-hover:-translate-y-2">
                       <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 transition-transform duration-700 group-hover:scale-110">
                          {item.type === "video" && (
                            <div className="z-10 absolute inset-0 flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/30 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4Z"/></svg>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
                       </div>
                       
                       {/* Floating Tag */}
                       <div className="absolute top-5 left-5 z-20">
                          <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black text-white backdrop-blur-xl border border-white/20 shadow-xl ${
                            item.type === 'video' ? 'bg-red-500/60' : item.type === 'exercise' ? 'bg-blue-500/60' : 'bg-emerald-500/60'
                          }`}>
                            {item.tag}
                          </span>
                       </div>
                    </div>

                    <div className="px-2">
                      <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-800 group-hover:text-primary transition-colors duration-300 mb-4 h-14 uppercase tracking-tighter">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {item.author.charAt(0)}
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.author}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                          <span className="flex items-center gap-1.5 text-highlight">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mb-0.5"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            {item.rating}
                          </span>
                          <span>{item.views} LƯỢT XEM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-100">
                <div className="mx-auto w-20 h-20 mb-6 text-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <p className="text-xl font-bold text-slate-400 tracking-tight italic">Rất tiếc, không tìm thấy kết quả phù hợp...</p>
                <button onClick={() => {setSearchQuery(""); setActiveFilter("all");}} className="mt-8 btn-primary">Xóa bộ lọc & Thử lại</button>
              </div>
            )}
          </div>
        </section>

        {/* --- EXPLORE BY SUBJECT --- */}
        <section className="py-24 bg-slate-50/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Navigation</span>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Khám phá theo môn học</h2>
              <div className="mt-4 h-1.5 w-24 bg-primary/10 mx-auto rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-primary animate-bounce-slow"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((subject) => (
                <div key={subject.id} className="flex flex-col items-center gap-6 rounded-[2.5rem] border border-white bg-white p-8 transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 cursor-pointer group shadow-sm border-b-4 border-b-slate-100 hover:border-b-primary">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                    {subject.icon === "code" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
                    {subject.icon === "brain" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>}
                    {subject.icon === "database" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>}
                    {subject.icon === "wifi" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>}
                    {subject.icon === "shield" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>}
                    {subject.icon === "settings" && <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                  </div>
                  <h4 className="text-center text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{subject.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="bg-primary py-32 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-900/50 to-primary"></div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <h2 className="text-4xl font-black lg:text-6xl tracking-tighter mb-8 uppercase leading-none">Cùng nhau lan tỏa <br/> tri thức CNTT</h2>
            <p className="max-w-2xl mx-auto text-xl text-emerald-100/70 font-medium mb-16 leading-relaxed">Góp sức xây dựng kho tàng học thuật VLU lớn mạnh bằng cách chia sẻ tài liệu của bạn ngay hôm nay.</p>
            <button className="group inline-flex items-center gap-4 rounded-[2rem] bg-white px-14 py-6 text-sm font-black text-primary shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-emerald-50 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              BẮT ĐẦU CHIA SẺ NGAY
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
