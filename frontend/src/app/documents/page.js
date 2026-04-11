"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Mock Data mở rộng
const categories = [
  { name: "Tất cả", count: 42 },
  { name: "Lập trình Web", count: 12 },
  { name: "DSA (Giải thuật)", count: 8 },
  { name: "Hệ điều hành", count: 5 },
  { name: "Mạng máy tính", count: 7 },
  { name: "Cơ sở dữ liệu", count: 6 },
  { name: "Đồ án / Khóa luận", count: 4 },
];

const mockDocuments = [
  { id: 1, title: "Đồ án ReactJS - Hệ thống Quản lý Thư viện số", category: "Lập trình Web", author: "Nguyễn Minh Triết", views: 1205, downloads: 450, type: "Source Code", date: "2 giờ trước" },
  { id: 2, title: "Slide bài giảng: Thuật toán Dijkstra & Ứng dụng thực tế", category: "DSA (Giải thuật)", author: "ThS. Trần Văn B", views: 850, downloads: 120, type: "Slide", date: "Hôm qua" },
  { id: 3, title: "Tổng hợp 100+ bài tập Python từ cơ bản đến nâng cao", category: "Lập trình Web", author: "Lê Thị Hồng", views: 3200, downloads: 1500, type: "PDF", date: "3 ngày trước" },
  { id: 4, title: "Xây dựng mô hình CNN nhận diện chữ viết tay", category: "Đồ án / Khóa luận", author: "Phạm Gia Bảo", views: 430, downloads: 85, type: "Source Code", date: "1 tuần trước" },
  { id: 5, title: "Tài liệu ôn thi CCNA: Full Lab & Theory (Tiếng Việt)", category: "Mạng máy tính", author: "Hoàng Anh Tuấn", views: 2100, downloads: 680, type: "PDF", date: "2 tuần trước" },
  { id: 6, title: "Cấu hình Docker Compose cho Microservices (Node.js + MongoDB)", category: "Lập trình Web", author: "Vũ Duy Khánh", views: 920, downloads: 310, type: "Source Code", date: "1 tháng trước" },
  { id: 7, title: "Nguyên lý Hệ điều hành: Tóm tắt kiến thức trọng tâm", category: "Hệ điều hành", author: "Văn Lang IT Team", views: 1540, downloads: 420, type: "PDF", date: "3 tháng trước" },
  { id: 8, title: "Thiết kế Cơ sở dữ liệu cho Hệ thống E-commerce", category: "Cơ sở dữ liệu", author: "Trần Minh Tâm", views: 760, downloads: 215, type: "Slide", date: "4 tháng trước" },
];

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  // Tự động điền searchQuery từ URL khi trang được tải
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const filteredDocs = mockDocuments.filter(doc => {
    const matchCategory = activeCategory === "Tất cả" || doc.category === activeCategory;
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Source Code': return 'bg-slate-900 text-white border-slate-900';
      case 'PDF': return 'bg-red-50 text-red-600 border-red-100';
      case 'Slide': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Source Code': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>;
      case 'PDF': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
      case 'Slide': return <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900">
      
      {/* Mini Header - More Functional, Less Flashy */}
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
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">2,400+ tệp</span>
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
          
          {/* Sidebar Filters - Sticky and Refined */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10 animate-fade-in">
            <div className="sticky top-28">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                Chuyên mục
                <span className="h-px flex-1 bg-slate-100 ml-4"></span>
              </h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === cat.name 
                        ? "bg-primary/5 text-primary border border-primary/10" 
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md transition-colors ${
                      activeCategory === cat.name ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="mt-12 p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-bl-full transition-transform group-hover:scale-150 duration-700"></div>
                 <h4 className="text-sm font-bold mb-2 relative z-10 italic">Yêu cầu tài liệu?</h4>
                 <p className="text-slate-400 text-[10px] font-medium leading-relaxed mb-4 relative z-10">Bạn không tìm thấy thứ mình cần? Hãy gửi yêu cầu cho cộng đồng.</p>
                 <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Gửi yêu cầu →</button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8">
            
            {/* Functional Search Bar - Integrated in ToolBar */}
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
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                 {['Mới nhất', 'Xem nhiều', 'Tải nhiều'].map(filter => (
                   <button key={filter} className="px-4 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm whitespace-nowrap">
                     {filter}
                   </button>
                 ))}
              </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <Link href={`/documents/${doc.id}`} key={doc.id} className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col h-full relative overflow-hidden">
                    {/* Subtle BG Pattern on Hover */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                    
                    {/* Header: Type & Category */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getTypeStyles(doc.type)}`}>
                        {getTypeIcon(doc.type)}
                        {doc.type}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        {doc.category}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold mb-6">
                         <div className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            {doc.views.toLocaleString()}
                         </div>
                         <div className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {doc.downloads.toLocaleString()}
                         </div>
                      </div>
                    </div>
                    
                    {/* Footer: Author & Meta */}
                    <div className="flex justify-between items-center pt-5 border-t border-slate-50 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
                          {doc.author.split(' ').pop().charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{doc.author}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{doc.date}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 font-bold">Không tìm thấy tài liệu phù hợp...</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredDocs.length > 0 && (
               <div className="flex items-center justify-center gap-2 pt-8">
                  <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  {[1, 2, 3].map((p, i) => (
                    <button key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${p === 1 ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-500'}`}>
                      {p}
                    </button>
                  ))}
                  <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
               </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
