"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [materials, setMaterials] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [matRes, majorRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`)
        ]);

        const matData = await matRes.json();
        const majorData = await majorRes.json();

        if (matData && Array.isArray(matData.materials)) {
          setMaterials(matData.materials.slice(0, 6));
        } else if (Array.isArray(matData)) {
          setMaterials(matData.slice(0, 6));
        }

        if (Array.isArray(majorData)) {
          setMajors(majorData);
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
            <a href="https://www.vlu.edu.vn/" target="_blank" rel="noopener noreferrer" className="block relative h-10 w-32 hover:scale-105 transition-transform">
              <Image src="/images/logo_vlu.png" alt="Logo Văn Lang" fill className="object-contain" />
            </a>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-normal lg:text-7xl mb-8 drop-shadow-2xl">
                <span className="text-white">TRẠM TRI THỨC</span> <br />
                <span className="inline-block py-2 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Cộng Đồng IT
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-100 font-medium px-4 max-w-2xl mx-auto drop-shadow-lg">
                Kho tàng tri thức số, kết hợp AI thông minh giúp định hướng tài liệu chuẩn xác cho sinh viên IT Văn Lang.
              </p>

              <form onSubmit={handleSearch} className="mt-12 w-full max-w-2xl mx-auto px-4 group">
                <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-2xl transition-all duration-300">
                  <div className="flex flex-1 items-center gap-4 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm tài liệu, bài giảng..." 
                      className="w-full bg-transparent py-3 text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">
                     TÌM KIẾM
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* --- SECTION 1: LATEST KNOWLEDGE --- */}
        <section className="bg-white py-24 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <span className="w-8 h-[2px] bg-emerald-600"></span>
                  Tri thức mới nhất
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Tài liệu vừa cập nhật"}
                </h2>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-5 py-2 text-[12px] font-bold rounded-xl transition-all ${
                      activeFilter === f.id
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1,2,3].map(i => (
                  <div key={i} className="h-80 bg-slate-50 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDocuments.map((item) => {
                  const configs = {
                    pdf: { icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "text-rose-500", bg: "bg-rose-50" },
                    video: { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "text-blue-500", bg: "bg-blue-50" },
                    docx: { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-indigo-500", bg: "bg-indigo-50" },
                    zip: { icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-amber-500", bg: "bg-amber-50" }
                  };
                  const config = configs[item.materialType] || configs.pdf;

                  return (
                    <Link href={`/documents/${item._id}`} key={item._id} className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
                      
                      <div className="p-6 sm:p-8 flex flex-col flex-1 relative z-10">
                        <div className="flex items-start justify-between mb-8">
                          <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm border border-white/50`}>
                            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d={config.icon}/></svg>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors shadow-sm">
                              {item.materialType}
                            </span>
                            <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-emerald-500">
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-4 mb-8">
                          <h3 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                            </div>
                            <span className="text-sm text-slate-500 font-semibold line-clamp-1">
                              {item.majorId?.name || "Chưa phân loại"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm group-hover:border-emerald-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              {item.uploaderId?.fullName?.charAt(0) || "U"}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Người đăng</span>
                               <span className="text-[13px] font-bold text-slate-800">{item.uploaderId?.fullName || "Ẩn danh"}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors">
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-amber-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                              {item.metrics?.averageRating || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 px-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              {item.metrics?.viewCount || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Không tìm thấy tài liệu phù hợp</p>
              </div>
            )}
            
            <div className="mt-16 text-center">
              <Link href="/documents" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 group">
                Xem tất cả tài liệu
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: WHY DATAHUB --- */}
        <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/5 -skew-x-12 translate-x-1/2"></div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="lg:w-1/2 relative group w-full">
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                  <Image 
                    src="/images/vlu.jpg" 
                    alt="DataHub Platform" 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-3xl font-black tracking-tight mb-2">VLU IT Community</p>
                    <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      Hệ sinh thái tri thức số
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Tại sao chọn DataHub?
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight uppercase italic">
                    Nền tảng tối ưu cho <br/>
                    <span className="text-emerald-600">sinh viên IT </span>
                    <span className="text-red-500">VLU</span>
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-lg">
                    Không chỉ là nơi lưu trữ, chúng tôi xây dựng một môi trường chia sẻ tri thức chủ động, hiện đại và chuẩn hóa, hỗ trợ bạn trên mỗi bước đường học tập.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { t: "Gợi ý thông minh", d: "AI tự động đề xuất tài liệu theo chuyên ngành.", i: "m13 10V3L4 14h7v7l9-11h-7z" },
                    { t: "Giao diện trực quan", d: "Trải nghiệm học tập hiện đại, dễ dàng thao tác.", i: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm0 8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6Z" },
                    { t: "Tài liệu chuẩn hóa", d: "Nội dung được kiểm duyệt nghiêm ngặt, chất lượng.", i: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                    { t: "Video trực quan", d: "Học nhanh hơn qua hàng trăm video bài giảng.", i: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }
                  ].map((f, i) => (
                    <div key={i} className="group p-6 rounded-[1.5rem] bg-white border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-100 transition-all duration-300">
                      <div className="w-12 h-12 mb-4 rounded-xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-emerald-100 transition-colors duration-300">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={f.i}/></svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{f.t}</h4>
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{f.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: QUICK MAJORS (SLEEK TAG UI) --- */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                  Khám phá <span className="text-emerald-600">Ngành học</span>
                </h2>
                <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
              </div>
              <p className="text-slate-400 font-medium text-xs uppercase tracking-widest hidden sm:block">
                Chọn chuyên ngành để xem tài liệu
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start">
              {majors.map((major) => {
                const configs = {
                  "SE": { icon: "M16 18l6-6-6-6M8 6l-6 6 6 6", color: "text-blue-500", bg: "hover:bg-blue-50 hover:border-blue-100" },
                  "AI": { icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M9 9h6v6H9V9z", color: "text-purple-500", bg: "hover:bg-purple-50 hover:border-purple-100" },
                  "IS": { icon: "M4 7v10c0 2 4 3.5 8 3.5s8-1.5 8-3.5V7M4 7c0 2 4 3.5 8 3.5s8-1.5 8-3.5M4 7c0-2 4-3.5 8-3.5s8 1.5 8 3.5m-16 5c0 2 4 3.5 8 3.5s8-1.5 8-3.5", color: "text-amber-500", bg: "hover:bg-amber-50 hover:border-amber-100" },
                  "CS": { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", color: "text-red-500", bg: "hover:bg-red-50 hover:border-red-100" }
                };
                const config = configs[major.majorCode] || configs.SE;

                return (
                  <Link 
                    href={`/documents?major=${major._id}`} 
                    key={major._id}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full border border-slate-100 bg-transparent transition-all duration-300 ${config.bg} hover:shadow-lg hover:shadow-slate-200/20 hover:-translate-y-1`}
                  >
                    <div className={`${config.color} transition-transform duration-500 group-hover:scale-110`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap group-hover:text-slate-900 transition-colors">
                      {major.name}
                    </span>
                    <svg className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
              
              <Link 
                href="/documents"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-[13px] font-bold"
              >
                Tất cả ngành
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-40 relative overflow-hidden bg-slate-50 border-y border-slate-100">
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4 opacity-40"></div>
          
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              <div className="flex flex-col items-center gap-4 mb-10">
                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-[0.4em] border border-emerald-100">
                  Sứ mệnh cộng đồng
                </span>
              </div>
              
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1] tracking-tight uppercase italic mb-10">
                Lan Tỏa <br className="md:hidden"/> 
                <span className="relative inline-block">
                   <span className="relative z-10 text-emerald-600">Tri Thức</span>
                   <span className="absolute bottom-2 left-0 w-full h-4 bg-emerald-100/60 -z-0"></span>
                </span>
                <br/>
                <span className="text-slate-300">Sinh Viên</span> <span className="text-red-500/80">IT VLU</span>
              </h2>
              
              <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-16">
                Biến những ghi chép cá nhân thành tài sản cộng đồng. Hãy cùng chúng tôi xây dựng thư viện số hiện đại nhất cho sinh viên IT Văn Lang.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  href="/upload" 
                  className="group relative inline-flex items-center gap-4 px-12 py-7 rounded-[2rem] bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 hover:-translate-y-1.5 transition-all duration-500 active:scale-95 overflow-hidden"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  Đóng góp ngay
                </Link>
                
                <Link 
                  href="/documents" 
                  className="px-12 py-7 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-sm uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300"
                >
                  Khám phá thư viện
                </Link>
              </div>

              <div className="mt-32 flex flex-wrap justify-center gap-x-16 gap-y-8">
                {[
                  { l: "Bảo mật thông tin", i: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" },
                  { l: "Kiểm duyệt nhanh", i: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" },
                  { l: "Bản quyền VLU", i: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 group/item cursor-default">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 transition-colors">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d={item.i}/></svg>
                    </div>
                    <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest group-hover/item:text-slate-600 transition-colors">
                      {item.l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
