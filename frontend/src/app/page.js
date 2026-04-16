"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [matRes, catRes] = await Promise.all([
          fetch("http://localhost:5000/api/materials"),
          fetch("http://localhost:5000/api/categories")
        ]);

        const matData = await matRes.json();
        const catData = await catRes.json();

        if (Array.isArray(matData)) {
          setMaterials(matData.slice(0, 6));
        }
        if (Array.isArray(catData)) {
          setCategories(catData);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    { id: "pdf", label: "Tài liệu PDF", icon: "file-text" },
    { id: "docx", label: "File Word", icon: "file-text" },
    { id: "zip", label: "Bài tập & Code", icon: "code" },
  ];

  const filteredDocuments = useMemo(() => {
    let docs = materials;
    
    if (searchQuery.trim()) {
      docs = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "all") {
      docs = docs.filter((doc) => doc.materialType === activeFilter);
    }

    return docs;
  }, [searchQuery, activeFilter, materials]);

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

          <div className="absolute bottom-8 right-8 z-20 hidden lg:block">
            <div className="relative h-10 w-32">
              <Image src="/images/logo_vlu.png" alt="Logo Văn Lang" fill className="object-contain" />
            </div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-black leading-[1.2] tracking-tighter lg:text-8xl mb-10 drop-shadow-2xl uppercase italic">
                <span className="text-white">TRẠM TRI THỨC</span> <br />
                <span className="inline-block py-2 bg-gradient-to-r from-emerald-400 via-emerald-200 to-blue-400 bg-clip-text text-transparent font-black">
                  CỘNG ĐỒNG IT
                </span>
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-slate-50 font-medium px-4 max-w-3xl mx-auto drop-shadow-lg tracking-wide">
                Kho tàng tri thức số, kết hợp AI thông minh giúp định hướng tài liệu chuẩn xác cho cộng đồng IT Văn Lang.
              </p>

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
              </form>
            </div>
          </div>
        </section>

        {/* --- MAIN CONTENT / MATERIALS --- */}
        <section className="bg-white py-24 relative border-t border-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Knowledge Base</span>
                <h2 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                  {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tài liệu mới nhất"}
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

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải tri thức...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((item, idx) => {
                    const thumbConfigs = {
                      pdf: { bg: "from-[#FF416C] to-[#FF4B2B]", shadow: "shadow-rose-500/20", accent: "bg-rose-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> },
                      video: { bg: "from-[#8E2DE2] to-[#4A00E0]", shadow: "shadow-indigo-500/20", accent: "bg-indigo-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> },
                      docx: { bg: "from-[#00c6ff] to-[#0072ff]", shadow: "shadow-blue-500/20", accent: "bg-blue-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
                      zip: { bg: "from-[#f2994a] to-[#f2c94c]", shadow: "shadow-amber-500/20", accent: "bg-amber-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
                    };
                    const config = thumbConfigs[item.materialType] || thumbConfigs.pdf;

                    return (
                      <Link href={`/documents/${item._id}`} key={item._id} className="group flex flex-col cursor-pointer transition-all duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-[40px] mb-8 transition-all duration-700 group-hover:-translate-y-3 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] ${config.shadow}`}>
                           <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} transition-transform duration-1000 group-hover:scale-110`}></div>
                           <div className="absolute top-0 -left-1/4 w-full h-full bg-white/20 blur-[100px] rounded-full group-hover:translate-x-1/2 transition-transform duration-1000"></div>
                           <div className="absolute bottom-0 -right-1/4 w-full h-full bg-black/10 blur-[100px] rounded-full group-hover:-translate-x-1/2 transition-transform duration-1000"></div>
                           <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                           <div className="absolute inset-0 flex items-center justify-center text-white">
                              <div className="relative p-6 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                 {config.icon}
                              </div>
                           </div>
                           <div className="absolute top-6 left-6 z-20">
                              <div className="flex items-center gap-2 rounded-xl px-4 py-1.5 bg-black/20 backdrop-blur-md border border-white/10 text-[9px] font-black tracking-widest text-white uppercase">
                                <div className={`w-1.5 h-1.5 rounded-full ${config.accent} animate-pulse`}></div>
                                {item.materialType}
                              </div>
                           </div>
                           {item.materialType === "video" && (
                             <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                               <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xl"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="m7 4 12 8-12 8V4Z"/></svg></div>
                             </div>
                           )}
                        </div>
                        <div className="px-3">
                          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-800 group-hover:text-emerald-600 transition-colors duration-300 mb-5 h-14 tracking-tight uppercase overflow-hidden italic">{item.title}</h3>
                          <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-black text-white group-hover:bg-emerald-500 transition-all">{item.uploaderId?.fullName?.charAt(0) || "U"}</div>
                              <span className="text-[12px] font-bold text-slate-600 tracking-tight uppercase">{item.uploaderId?.fullName || "Người dùng"}</span>
                            </div>
                            <div className="flex items-center gap-5 text-[11px] font-black text-slate-400 uppercase">
                              <span className="flex items-center gap-1.5 text-emerald-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mb-0.5"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>{item.metrics?.averageRating || 0}</span>
                              <span className="tracking-widest">{item.metrics?.viewCount || 0} LƯỢT XEM</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-20 text-center">
                  <Link href="/documents" className="inline-flex items-center gap-4 px-12 py-6 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 group">
                    Khám phá toàn bộ thư viện
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-32 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
                <p className="text-2xl font-black text-slate-400 tracking-tighter italic uppercase">Chưa có tài liệu nào...</p>
                <Link href="/upload" className="mt-8 inline-block px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">CHIA SẺ NGAY</Link>
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
              {categories.map((subject) => (
                <Link 
                  href={`/documents?category=${subject._id}`}
                  key={subject._id} 
                  className="flex flex-col items-center gap-6 rounded-[35px] border border-white bg-white p-10 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-3 cursor-pointer group shadow-sm"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    {subject.name.toLowerCase().includes("lập trình") || subject.name.toLowerCase().includes("code") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    ) : subject.name.toLowerCase().includes("dữ liệu") || subject.name.toLowerCase().includes("database") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
                    ) : subject.name.toLowerCase().includes("mạng") || subject.name.toLowerCase().includes("web") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                    ) : subject.name.toLowerCase().includes("trí tuệ") || subject.name.toLowerCase().includes("ai") ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    )}
                  </div>
                  <h4 className="text-center text-[10px] font-black text-slate-800 uppercase tracking-wider group-hover:text-primary transition-colors leading-tight h-8 flex items-center">{subject.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
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
