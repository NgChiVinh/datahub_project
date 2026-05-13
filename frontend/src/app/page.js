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
          fetch("http://localhost:5000/api/materials"),
          fetch("http://localhost:5000/api/majors")
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
            <div className="relative h-10 w-32">
              <Image src="/images/logo_vlu.png" alt="Logo Văn Lang" fill className="object-contain" />
            </div>
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

        {/* --- MAIN CONTENT / MATERIALS --- */}
        <section className="bg-white py-24 relative border-t border-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 block">Knowledge Base</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {searchQuery ? `Kết quả cho "${searchQuery}"` : "Tài liệu mới nhất"}
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all border ${
                      activeFilter === f.id
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent"></div>
                <p className="mt-4 text-slate-500 font-medium text-sm">Đang tải tri thức...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDocuments.map((item, idx) => {
                    const thumbConfigs = {
                      pdf: { bg: "from-rose-500 to-red-600", accent: "bg-rose-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> },
                      video: { bg: "from-indigo-500 to-blue-700", accent: "bg-indigo-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> },
                      docx: { bg: "from-blue-500 to-cyan-600", accent: "bg-blue-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
                      zip: { bg: "from-amber-500 to-orange-600", accent: "bg-amber-500", icon: <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
                    };
                    const config = thumbConfigs[item.materialType] || thumbConfigs.pdf;

                    return (
                      <Link href={`/documents/${item._id}`} key={item._id} className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className={`relative aspect-video w-full bg-gradient-to-br ${config.bg} flex items-center justify-center text-white`}>
                           <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                              {config.icon}
                           </div>
                           <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 rounded-lg bg-black/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
                                {item.materialType}
                              </span>
                           </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2 mb-4 h-14">
                            {item.title}
                          </h3>
                          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {item.uploaderId?.fullName?.charAt(0) || "U"}
                              </div>
                              <span className="text-sm font-medium text-slate-600">{item.uploaderId?.fullName || "Người dùng"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-600">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                {item.metrics?.averageRating || 0}
                              </span>
                              <span>{item.metrics?.viewCount || 0} lượt xem</span>
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

        {/* --- SYSTEM STATS & FEATURES --- */}
        <section className="py-32 bg-[#f8fafc] border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/2"></div>
          
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              {/* Left Side: Text */}
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-4 block">Hệ sinh thái thông minh</span>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight uppercase italic">
                    Nâng tầm trải nghiệm <br/> học tập của bạn
                  </h2>
                </div>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  DataHub không chỉ là nơi lưu trữ, chúng tôi xây dựng một môi trường chia sẻ tri thức chủ động, hỗ trợ bởi AI dành riêng cho sinh viên VLU.
                </p>
                
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 mb-1">1.2k+</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài liệu đã duyệt</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 mb-1">500+</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video bài giảng</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 mb-1">2.5k+</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinh viên tham gia</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 mb-1">98%</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mức độ hài lòng</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Feature Cards */}
              <div className="lg:w-1/2 grid grid-cols-1 gap-6">
                {[
                  {
                    title: "Kho lưu trữ chuẩn hóa",
                    desc: "Tài liệu được phân loại theo chuyên ngành và năm học, kiểm duyệt nghiêm ngặt.",
                    icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
                    color: "bg-blue-500"
                  },
                  {
                    title: "Học qua Video bài giảng",
                    desc: "Hàng trăm bài giảng trực quan giúp bạn nắm bắt kiến thức nhanh chóng hơn.",
                    icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
                    color: "bg-indigo-500"
                  },
                  {
                    title: "AI gợi ý thông minh",
                    desc: "Tự động đề xuất tài liệu phù hợp dựa trên lịch sử tìm kiếm và sở thích của bạn.",
                    icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                    color: "bg-emerald-500"
                  }
                ].map((feature, i) => (
                  <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-slate-400 font-bold leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="bg-slate-900 py-32 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <h2 className="text-4xl font-bold lg:text-7xl tracking-normal mb-10 leading-[1.2]">
              Lan Tỏa Tri Thức <br/> 
              <span className="text-emerald-400 uppercase tracking-tight">Cộng Đồng IT VLU</span>
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
