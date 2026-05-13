"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DocumentsPage() {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMaterials: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [majors, setMajors] = useState([
    { _id: "all", name: "Tất cả chuyên ngành" },
  ]);
  const [categories, setCategories] = useState([
    { _id: "all", name: "Tất cả danh mục" },
  ]);
  
  const [activeMajor, setActiveMajor] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  
  // 1. Lấy dữ liệu ban đầu và đồng bộ từ URL
  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialMajor = searchParams.get("major") || "all";
    const initialCategory = searchParams.get("category") || "all";

    if (initialSearch) setSearchQuery(initialSearch);
    if (initialMajor !== "all") setActiveMajor(initialMajor);
    if (initialCategory !== "all") setActiveCategory(initialCategory);

    const fetchMetadata = async () => {
      try {
        const [majorRes, categoryRes] = await Promise.all([
          fetch("http://localhost:5000/api/majors"),
          fetch("http://localhost:5000/api/categories")
        ]);
        
        const majorData = await majorRes.json();
        const categoryData = await categoryRes.json();

        if (Array.isArray(majorData))
          setMajors([{ _id: "all", name: "Tất cả chuyên ngành" }, ...majorData]);
        
        if (Array.isArray(categoryData))
          setCategories([{ _id: "all", name: "Tất cả danh mục" }, ...categoryData]);
      } catch (error) {
        console.error("Lỗi lấy metadata:", error);
      }
    };
    fetchMetadata();
  }, [searchParams]);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [activeMajor, activeCategory, activeYear, searchQuery, sortBy]);

  // 2. Fetch Materials dựa trên bộ lọc và sắp xếp
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("materialType", "not_video");
        params.append("page", currentPage);
        params.append("limit", 8);
        if (activeMajor !== "all") params.append("major", activeMajor);
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (activeYear !== "all") params.append("academicYear", activeYear);
        if (sortBy !== "newest") params.append("sortBy", sortBy);
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(
          `http://localhost:5000/api/materials?${params.toString()}`,
        );
        const data = await res.json();

        if (data && data.materials && data.pagination) {
          setMaterials(data.materials);
          setPagination(data.pagination);
        } else if (Array.isArray(data)) {
          setMaterials(data);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalMaterials: data.length
          });
        }
      } catch (error) {
        console.error("Lỗi lấy tài liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchMaterials();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [activeMajor, activeCategory, activeYear, searchQuery, sortBy, currentPage]);

  const years = [
    { id: "all", name: "Tất cả" },
    { id: "Năm 1", name: "Năm 1" },
    { id: "Năm 2", name: "Năm 2" },
    { id: "Năm 3", name: "Năm 3" },
    { id: "Năm 4", name: "Năm 4" },
  ];

  const getTypeStyles = (type) => {
    switch (type) {
      case "pdf": return "bg-red-50 text-red-600 border-red-100";
      case "docx": return "bg-blue-50 text-blue-600 border-blue-100";
      case "pptx": return "bg-orange-50 text-orange-600 border-orange-100";
      case "zip": return "bg-slate-900 text-white border-slate-900";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900">
      {/* Mini Header */}
      <section className="bg-white border-b border-slate-100 pt-10 pb-10">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
              <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-primary">Thư viện tài liệu</span>
            </nav>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Thư viện Tri thức
              <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {pagination.totalMaterials || 0}+ tệp
              </span>
            </h1>
          </div>
          <Link href="/upload" className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Đóng góp tài liệu mới
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
            <div className="sticky top-28 space-y-10">
              {/* Major Filter */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                  Chuyên ngành
                  <span className="h-px flex-1 bg-slate-100 ml-4"></span>
                </h3>
                <div className="flex flex-col gap-2">
                  {majors.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => setActiveMajor(m._id)}
                      className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                        activeMajor === m._id
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                          : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                  Danh mục
                  <span className="h-px flex-1 bg-slate-100 ml-4"></span>
                </h3>
                <div className="flex flex-col gap-2">
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setActiveCategory(c._id)}
                      className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                        activeCategory === c._id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                          : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                  Năm học
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
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8">
            {/* Search & Sort Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Tìm tài liệu theo tên hoặc từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                {["newest", "most_viewed", "top_rated"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      sortBy === s ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s === "newest" ? "Mới nhất" : s === "most_viewed" ? "Xem nhiều" : "Đánh giá cao"}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 h-64 animate-pulse"></div>
                ))
              ) : materials.length > 0 ? (
                materials.map((doc) => (
                  <div key={doc._id} className="group bg-white rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all flex flex-col h-full overflow-hidden">
                    <Link href={`/documents/${doc._id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-50">
                      <div className={`w-full h-full flex items-center justify-center ${getTypeStyles(doc.materialType)}`}>
                        <span className="text-4xl font-black uppercase">{doc.materialType}</span>
                      </div>
                    </Link>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {doc.majorId?.name || "Chung"}
                        </span>
                        {doc.categoryId && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                            {doc.categoryId.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 uppercase italic tracking-tight">
                        {doc.title}
                      </h3>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                            {doc.uploaderId?.fullName?.charAt(0) || "U"}
                          </div>
                          <p className="text-[9px] font-black text-slate-800 uppercase truncate max-w-[100px]">
                            {doc.uploaderId?.fullName}
                          </p>
                        </div>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">
                    Không tìm thấy tài liệu phù hợp...
                  </h3>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${
                      currentPage === i + 1 ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-100 text-slate-400 hover:border-primary/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
