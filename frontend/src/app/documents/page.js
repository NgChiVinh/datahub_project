"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DocumentsPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([{ _id: "all", name: "Tất cả" }]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();

  // 1. Lấy dữ liệu từ API (Materials & Categories)
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
          // Chỉ lấy những tài liệu đã được duyệt (approved)
          setMaterials(matData.filter(m => m.status === "approved"));
        }
        
        if (Array.isArray(catData)) {
          setCategories([{ _id: "all", name: "Tất cả" }, ...catData]);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Tự động điền searchQuery từ URL (nếu có)
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // 3. Logic lọc dữ liệu
  const filteredDocs = materials.filter(doc => {
    const matchCategory = activeCategory === "all" || doc.categoryId?._id === activeCategory;
    const matchYear = activeYear === "all" || doc.academicYear === activeYear;
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchYear && matchSearch;
  });

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
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 animate-fade-in">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Lọc tài liệu theo tên, tác giả hoặc từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải tài liệu...</div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <Link href={`/documents/${doc._id}`} key={doc._id} className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getTypeStyles(doc.materialType)}`}>
                        {getTypeIcon(doc.materialType)}
                        {doc.materialType}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        {doc.categoryId?.name}
                      </span>
                    </div>
                    
                    <div className="flex-1 relative z-10">
                      <h3 className="text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold mb-6">
                         <div className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            {doc.metrics?.viewCount?.toLocaleString() || 0}
                         </div>
                         <div className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {doc.metrics?.downloadCount?.toLocaleString() || 0}
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-5 border-t border-slate-50 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
                          {doc.uploaderId?.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{doc.uploaderId?.fullName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hiện chưa có tài liệu nào trong mục này...</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
