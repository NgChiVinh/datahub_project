"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DocumentsPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([{ _id: "all", name: "Tất cả" }]);
  const [majors, setMajors] = useState([{ _id: "all", name: "Tất cả chuyên ngành" }]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMajor, setActiveMajor] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();

  // 1. Lấy dữ liệu ban đầu (Categories & Majors)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, majorRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/majors")
        ]);
        const catData = await catRes.json();
        const majorData = await majorRes.json();
        
        if (Array.isArray(catData)) setCategories([{ _id: "all", name: "Tất cả" }, ...catData]);
        if (Array.isArray(majorData)) setMajors([{ _id: "all", name: "Tất cả chuyên ngành" }, ...majorData]);
      } catch (error) {
        console.error("Lỗi lấy metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch Materials dựa trên bộ lọc và sắp xếp
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("materialType", "not_video"); // Loại trừ video ra khỏi trang tài liệu
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (activeMajor !== "all") params.append("major", activeMajor);
        if (activeYear !== "all") params.append("academicYear", activeYear);
        if (sortBy !== "newest") params.append("sortBy", sortBy);
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(`http://localhost:5000/api/materials?${params.toString()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setMaterials(data);
        }
      } catch (error) {
        console.error("Lỗi lấy tài liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchMaterials();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, activeMajor, activeYear, searchQuery, sortBy]);

  // UI Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 h-full animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="w-16 h-4 bg-slate-100 rounded-lg"></div>
        <div className="w-20 h-4 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="w-full h-6 bg-slate-100 rounded-xl mb-4"></div>
      <div className="w-3/4 h-6 bg-slate-100 rounded-xl mb-6"></div>
      <div className="flex gap-3 mb-8">
        <div className="w-8 h-4 bg-slate-50 rounded-md"></div>
        <div className="w-8 h-4 bg-slate-50 rounded-md"></div>
      </div>
      <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
          <div className="w-20 h-3 bg-slate-100 rounded-md"></div>
        </div>
        <div className="w-16 h-3 bg-slate-50 rounded-md"></div>
      </div>
    </div>
  );

  const getTypeStyles = (type) => {
    switch (type) {
      case 'video': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'pdf': return 'bg-red-50 text-red-600 border-red-100';
      case 'docx': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'zip': return 'bg-slate-900 text-white border-slate-900';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
      case 'pdf': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
      case 'docx': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
      default: return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>;
    }
  };

  const years = [
    { id: "all", name: "Tất cả các năm" },
    { id: "Năm 1", name: "Năm 1" },
    { id: "Năm 2", name: "Năm 2" },
    { id: "Năm 3", name: "Năm 3" },
    { id: "Năm 4", name: "Năm 4" },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900">
      
      {/* Mini Header */}
      <section className="bg-white border-b border-slate-100 pt-10 pb-10">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-fade-in">
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
               <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
               <span>/</span>
               <span className="text-primary">Thư viện tài liệu</span>
            </nav>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Thư viện Tri thức
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {materials.length}+ tệp
              </span>
            </h1>
          </div>
          
          <Link href="/upload" className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all animate-fade-in">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Đóng góp tài liệu mới
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10 animate-fade-in">
            <div className="sticky top-28">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                Chuyên ngành
                <span className="h-px flex-1 bg-slate-100 ml-4"></span>
              </h3>
              <nav className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {majors.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => setActiveMajor(m._id)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeMajor === m._id 
                        ? "bg-primary/5 text-primary border border-primary/10" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </nav>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 mt-10 flex items-center justify-between">
                Chuyên mục
                <span className="h-px flex-1 bg-slate-100 ml-4"></span>
              </h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === cat._id 
                        ? "bg-primary/5 text-primary border border-primary/10" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </nav>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 mt-10 flex items-center justify-between">
                Lộ trình Năm học
                <span className="h-px flex-1 bg-slate-100 ml-4"></span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {years.map((y) => (
                  <button
                    key={y.id}
                    onClick={() => setActiveYear(y.id)}
                    className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      activeYear === y.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {y.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8">
            
            {/* Search & Sort Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 animate-fade-in">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Tìm tài liệu theo tên hoặc từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                {[
                  { id: "newest", label: "Mới nhất", icon: "clock" },
                  { id: "most_viewed", label: "Xem nhiều", icon: "eye" },
                  { id: "top_rated", label: "Đánh giá cao", icon: "star" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      sortBy === s.id 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              {isLoading ? (
                // Hiển thị 6 thẻ Skeleton khi đang tải
                [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              ) : materials.length > 0 ? (
                materials
                  .filter(doc => doc.materialType !== "video") // Lọc thêm 1 lần nữa ở Frontend để đảm bảo 100%
                  .map((doc) => (
                  <div key={doc._id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-primary/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all flex flex-col h-full relative overflow-hidden">
                    {/* Hot Badge */}
                    {doc.metrics?.viewCount > 1000 && (
                      <div className="absolute -right-12 top-6 bg-red-500 text-white px-12 py-1 rotate-45 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg z-20">
                        Hot
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${getTypeStyles(doc.materialType)}`}>
                        {getTypeIcon(doc.materialType)}
                        {doc.materialType}
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-all active:scale-90 border border-slate-100">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                      </button>
                    </div>
                    
                    <Link href={`/documents/${doc._id}`} className="flex-1 relative z-10">
                      <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 uppercase italic tracking-tight">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            {doc.metrics?.viewCount?.toLocaleString() || 0}
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {doc.metrics?.downloadCount?.toLocaleString() || 0}
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            {doc.metrics?.averageRating || 0}
                         </div>
                      </div>
                    </Link>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-slate-50 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 border-2 border-white shadow-sm group-hover:from-primary group-hover:to-blue-600 group-hover:text-white transition-all duration-500">
                          {doc.uploaderId?.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{doc.uploaderId?.fullName}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            {doc.categoryId?.name} {doc.majorId?.name && `• ${doc.majorId.name}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                      <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </div>
                   <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Không tìm thấy tài liệu phù hợp...</h3>
                   <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-2">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
