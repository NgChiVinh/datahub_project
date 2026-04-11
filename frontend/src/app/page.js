"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, FEATURED_DOCUMENTS } from "@/data/mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/documents");
    }
  };

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
    <div className="bg-white font-sans text-slate-900 overflow-x-hidden">
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
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-black leading-[1.2] tracking-tighter lg:text-8xl mb-10 drop-shadow-2xl uppercase italic">
                <span className="text-white">TRẠM TRI THỨC</span> <br />
                <span className="inline-block py-2 bg-gradient-to-r from-emerald-400 via-emerald-200 to-blue-400 bg-clip-text text-transparent font-black">
                  CỘNG ĐỒNG IT
                </span>
              </h1>
              
              <p className="mt-8 text-xl leading-relaxed text-slate-50 font-medium px-4 max-w-3xl mx-auto opacity-100 drop-shadow-lg tracking-wide">
                Kho tàng tri thức số, kết hợp AI thông minh giúp định hướng tài liệu chuẩn xác cho cộng đồng IT Văn Lang.
              </p>

              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="mt-12 w-full max-w-2xl mx-auto px-4 group">
                <div className="relative flex items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl p-1.5 shadow-2xl transition-all duration-500 focus-within:bg-white focus-within:ring-8 focus-within:ring-primary/5">
                  <div className="flex flex-1 items-center gap-4 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm tài liệu, bài giảng..." 
                      className="w-full bg-transparent py-3 text-base font-bold text-white outline-none placeholder:text-slate-300 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="rounded-xl bg-primary px-8 py-3.5 text-[10px] font-black text-white shadow-xl hover:bg-emerald-800 active:scale-95 transition-all uppercase tracking-widest">
                     TÌM KIẾM
                  </button>
                </div>

                {/* Trending Tags */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  <span className="opacity-50 text-emerald-400">Xu hướng:</span>
                  <button type="button" onClick={() => setSearchQuery("Python")} className="hover:text-emerald-300 transition-colors border-b border-transparent hover:border-emerald-300">#PYTHON</button>
                  <button type="button" onClick={() => setSearchQuery("DSA")} className="hover:text-emerald-300 transition-colors border-b border-transparent hover:border-emerald-300">#DSA</button>
                  <button type="button" onClick={() => setSearchQuery("Next.js")} className="hover:text-emerald-300 transition-colors border-b border-transparent hover:border-emerald-300">#NEXTJS</button>
                </div>
              </form>
            </div>

            {/* ADJUSTED VLU LOGO (SMALLER & REFINED) */}
            <div className="absolute bottom-[-140px] right-4 lg:right-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image 
                  src="/images/logo_vlu.png" 
                  alt="Logo VLU" 
                  width={125} 
                  height={50} 
                  className="relative h-auto w-24 lg:w-36 object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.5)] brightness-110 transition-all duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- MAIN CONTENT / FILTERS (UPGRADED STYLE KEPT) --- */}
        <section className="bg-white py-24 relative border-t border-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Knowledge Base</span>
                <h2 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                  {searchQuery ? `Kết quả cho "${searchQuery}"` : "Dành riêng cho bạn"}
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex items-center gap-3 rounded-[20px] px-6 py-3 text-[11px] font-black transition-all whitespace-nowrap border-2 active:scale-95 ${
                      activeFilter === f.id
                        ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20"
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((item, idx) => (
                  <div key={item.id} className="group flex flex-col cursor-pointer transition-all duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[40px] bg-slate-100 mb-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] group-hover:shadow-[0_40px_80px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 group-hover:-translate-y-3">
                       <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950">
                          {item.type === "video" && (
                            <div className="z-10 absolute inset-0 flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-2xl text-white border border-white/20 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4Z"/></svg>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent group-hover:scale-125 transition-transform duration-1000"></div>
                       </div>
                       
                       <div className="absolute top-6 left-6 z-20">
                          <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black text-white shadow-lg tracking-widest uppercase ${
                            item.type === 'video' ? 'bg-red-500' : item.type === 'exercise' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}>
                            {item.tag}
                          </span>
                       </div>
                    </div>

                    <div className="px-3">
                      <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-800 group-hover:text-emerald-600 transition-colors duration-300 mb-5 h-14 tracking-tight uppercase text-wrap overflow-hidden">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:from-emerald-50 group-hover:to-emerald-100 group-hover:text-emerald-600 transition-all">
                            {item.author.charAt(0)}
                          </div>
                          <span className="text-[12px] font-bold text-slate-600 tracking-tight uppercase">{item.author}</span>
                        </div>
                        <div className="flex items-center gap-5 text-[11px] font-black text-slate-400 uppercase">
                          <span className="flex items-center gap-1.5 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mb-0.5"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            {item.rating}
                          </span>
                          <span className="tracking-widest">{item.views} LƯỢT XEM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
                <div className="mx-auto w-24 h-24 mb-6 text-slate-200 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <p className="text-2xl font-black text-slate-400 tracking-tighter italic uppercase">Không có tài liệu nào phù hợp...</p>
                <button onClick={() => {setSearchQuery(""); setActiveFilter("all");}} className="mt-8 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">KHÁM PHÁ LẠI</button>
              </div>
            )}
          </div>
        </section>

        {/* --- EXPLORE BY SUBJECT --- */}
        <section className="py-24 bg-[#f8fafc] border-y border-slate-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-24">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] mb-4 block">Navigation</span>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Khám phá theo môn học</h2>
              <div className="mt-6 h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((subject) => (
                <div key={subject.id} className="flex flex-col items-center gap-6 rounded-[35px] border border-white bg-white p-10 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-3 cursor-pointer group shadow-sm">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    {subject.icon === "code" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
                    {subject.icon === "brain" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>}
                    {subject.icon === "database" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>}
                    {subject.icon === "wifi" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>}
                    {subject.icon === "shield" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>}
                    {subject.icon === "settings" && <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                  </div>
                  <h4 className="text-center text-[10px] font-black text-slate-800 uppercase tracking-wider group-hover:text-primary transition-colors leading-tight h-8 flex items-center">{subject.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA SECTION (REPAIRED SPACING) --- */}
        <section className="bg-slate-900 py-32 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <h2 className="text-4xl font-black lg:text-7xl tracking-tighter mb-10 uppercase leading-[1.2]">
              Lan tỏa tri thức <br/> 
              <span className="text-emerald-400">Cộng đồng IT VLU</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-16 leading-relaxed">
              Hãy trở thành một phần của thư viện tri thức lớn nhất dành riêng cho sinh viên CNTT Văn Lang.
            </p>
            <Link href="/upload" className="group inline-flex items-center gap-5 rounded-[24px] bg-primary px-16 py-7 text-sm font-black text-white shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-2 transition-transform duration-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Đóng góp tài liệu ngay
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
