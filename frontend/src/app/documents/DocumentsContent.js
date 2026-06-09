"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AddToCollectionModal from "@/components/AddToCollectionModal";

export default function DocumentsContent() {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMaterials: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [activeMajorId, setActiveMajorId] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMajor, setActiveMajor] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  // AI semantic search
  const [aiMode, setAiMode] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [showingAi, setShowingAi] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const searchParams = useSearchParams();

  const handleAddToCollection = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedMaterialId(id);
    setIsCollectionModalOpen(true);
  };

  const logClick = async (materialId, materialTitle) => {
    if (!searchQuery.trim()) return; // Chỉ log khi người dùng có thực hiện tìm kiếm

    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/search-logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            searchQuery: searchQuery.trim(),
            clickedMaterialId: materialId,
          }),
        },
      );
    } catch (err) {
      console.error("Lỗi log click:", err);
    }
  };

  // Tìm kiếm ngữ nghĩa bằng AI (gọi khi nhấn Enter trong chế độ AI)
  const runAiSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setShowingAi(false);
      return;
    }
    try {
      setIsAiSearching(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recommendations/search?q=${encodeURIComponent(q)}&limit=12&type=not_video`,
      );
      const json = await res.json();
      setAiResults(Array.isArray(json?.data) ? json.data : []);
      setShowingAi(true);
    } catch (err) {
      console.error("Lỗi tìm kiếm AI:", err);
      setAiResults([]);
      setShowingAi(true);
    } finally {
      setIsAiSearching(false);
    }
  };
  
  // 1. Lấy dữ liệu ban đầu và đồng bộ từ URL
  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || "all";
    const initialMajor = searchParams.get("major") || "all";
    const initialType = searchParams.get("type") || "all";

    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCategory !== "all") setActiveCategory(initialCategory);
    if (initialType !== "all") setActiveType(initialType);
    if (initialMajor !== "all") {
      setActiveMajor(initialMajor);
      setActiveMajorId(initialMajor);
    }

    const fetchMetadata = async () => {
      try {
        const [catRes, majorRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`,
          ),
        ]);
        const catData = await catRes.json();
        const majorData = await majorRes.json();

        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(majorData)) setMajors(majorData);
      } catch (error) {
        console.error("Lỗi lấy metadata:", error);
      }
    };
    fetchMetadata();
  }, [searchParams]);

  const handleMajorClick = (id) => {
    setActiveMajorId(activeMajorId === id ? null : id);
    setActiveMajor(id);
    setActiveCategory("all"); // Reset category when major changes
  };

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeMajor, activeType, searchQuery, sortBy]);

  const fileTypes = [
    { id: "all", name: "Tất cả định dạng" },
    { id: "pdf", name: "Tài liệu PDF" },
    { id: "docx", name: "Văn bản Word" },
    { id: "pptx", name: "Slide Bài giảng" },
    { id: "zip", name: "File nén (Zip/Rar)" },
  ];

  const getTypeStyles = (type) => {
    switch (type) {
      case "pdf":
        return "from-rose-50 to-rose-100/50 text-rose-600 border-rose-200";
      case "docx":
        return "from-blue-50 to-blue-100/50 text-blue-600 border-blue-200";
      case "pptx":
        return "from-orange-50 to-orange-100/50 text-orange-600 border-orange-200";
      case "zip":
        return "from-slate-100 to-slate-200/50 text-slate-700 border-slate-300";
      default:
        return "from-slate-50 to-slate-100/50 text-slate-500 border-slate-200";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "docx":
        return (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path d="M9 17h6M9 13h6" />
          </svg>
        );
      default:
        return (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setActiveMajor("all");
    setActiveMajorId(null);
    setActiveType("all");
    setSearchQuery("");
  };

  const hasFilters =
    activeCategory !== "all" ||
    activeMajor !== "all" ||
    activeType !== "all" ||
    searchQuery !== "";

  // 2. Fetch Materials dựa trên bộ lọc và sắp xếp
  useEffect(() => {
    if (aiMode) return; // Ở chế độ AI thì không chạy tìm kiếm thường
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();

        // Logic lọc type
        if (activeType === "all") {
          params.append("materialType", "not_video");
        } else {
          params.append("materialType", activeType);
        }

        params.append("page", currentPage);
        params.append("limit", 9); // Thay đổi thành 9 tài liệu mỗi trang
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (activeMajor !== "all") params.append("major", activeMajor);
        if (sortBy !== "newest") params.append("sortBy", sortBy);
        if (searchQuery) params.append("search", searchQuery);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials?${params.toString()}`,
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
            totalMaterials: data.length,
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
  }, [activeCategory, activeMajor, activeType, searchQuery, sortBy, currentPage, aiMode]);

  // Tạo dải số trang có rút gọn: 1 … 4 5 [6] 7 8 … 20
  const getPageRange = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Compact Clean Header */}
      <section className="bg-slate-50/50 border-b border-slate-100 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                <Link
                  href="/"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-slate-600">Thư viện tài liệu</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Thư viện <span className="text-emerald-500">Tài liệu</span>
              </h1>
            </div>
            <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Đóng góp tài liệu
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-28 space-y-10">
              {/* Category Group */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                    Chuyên ngành
                  </h3>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold text-emerald-500 hover:underline"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setActiveCategory("all");
                      setActiveMajor("all");
                      setActiveMajorId(null);
                    }}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeMajor === "all" && activeCategory === "all"
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Tất cả tài liệu
                  </button>

                  {majors.map((major) => {
                    const children = categories.filter(
                      (c) => (c.majorId?._id || c.majorId) === major._id,
                    );
                    const isOpen = activeMajorId === major._id;
                    const isSelected = activeMajor === major._id;
                    const hasActiveChild = children.some(
                      (child) => activeCategory === child._id,
                    );

                    return (
                      <div key={major._id} className="space-y-1">
                        <button
                          onClick={() => handleMajorClick(major._id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected || hasActiveChild
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate pr-2">{major.name}</span>
                          {children.length > 0 && (
                            <svg
                              width="10"
                              height="10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="3"
                              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "opacity-40"}`}
                            >
                              <path
                                d="M19 9l-7 7-7-7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                            </svg>
                          )}
                        </button>

                        {isOpen && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-50 pl-2">
                            {children.map((child) => (
                              <button
                                key={child._id}
                                onClick={() => setActiveCategory(child._id)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                                  activeCategory === child._id
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-400 hover:text-emerald-500"
                                }`}
                              >
                                {child.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* File Type Group */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                  Định dạng file
                </h3>
                <div className="flex flex-col gap-1.5">
                  {fileTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveType(type.id)}
                      className={`text-left px-5 py-3 rounded-xl text-xs font-bold transition-all border ${
                        activeType === type.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                          : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={aiMode ? "Tìm theo ý nghĩa rồi nhấn Enter..." : "Tìm tài liệu theo môn học, tiêu đề..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && aiMode) {
                      e.preventDefault();
                      runAiSearch();
                    }
                  }}
                  className={`w-full pl-12 pr-6 py-4 rounded-2xl bg-white border outline-none transition-all text-sm font-medium ${
                    aiMode
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5"
                  }`}
                />
              </div>

              <button
                onClick={() => {
                  const next = !aiMode;
                  setAiMode(next);
                  if (!next) setShowingAi(false); // tắt AI -> quay lại danh sách thường
                }}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  aiMode
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-white text-slate-400 border-slate-200 hover:text-emerald-500 hover:border-emerald-200"
                }`}
                title="Tìm kiếm thông minh bằng AI"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                Tìm kiếm AI
              </button>

              <div className="flex p-1 bg-slate-100 rounded-2xl">
                {[
                  { id: "newest", name: "Mới nhất" },
                  { id: "most_viewed", name: "Xem nhiều" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-6 py-3 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                      sortBy === s.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner chế độ AI */}
            {showingAi && (
              <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700">
                  Kết quả tìm kiếm AI cho: <span className="font-black">&ldquo;{searchQuery}&rdquo;</span>
                  <span className="text-emerald-500 font-medium ml-2">({aiResults.length} tài liệu liên quan)</span>
                </p>
                <button
                  onClick={() => { setShowingAi(false); setAiMode(false); }}
                  className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest shrink-0"
                >
                  Thoát AI
                </button>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(isAiSearching || (!showingAi && isLoading)) ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-2xl h-64 animate-pulse"
                  ></div>
                ))
              ) : (showingAi ? aiResults : materials).length > 0 ? (
                (showingAi ? aiResults : materials).map((doc) => (
                  <div key={doc._id} className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col h-full overflow-hidden">
                    <Link
                      href={`/documents/${doc._id}`}
                      className="block relative aspect-[16/11] overflow-hidden"
                      onClick={() => logClick(doc._id, doc.title)}
                    >
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br transition-transform duration-500 group-hover:scale-105 ${getTypeStyles(doc.materialType)}`}
                      >
                        <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          {getFileIcon(doc.materialType)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                          {doc.materialType}
                        </span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[9px] font-bold text-slate-800 uppercase border border-white">
                          {doc.academicYear || "Khác"}
                        </span>
                      </div>
                      {showingAi && typeof doc.score === "number" && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-sm text-[9px] font-black uppercase tracking-widest">
                            {Math.round(doc.score * 100)}% liên quan
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 truncate">
                        {doc.categoryId?.name}
                      </p>

                      <Link
                        href={`/documents/${doc._id}`}
                        onClick={() => logClick(doc._id, doc.title)}
                      >
                        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 hover:text-emerald-600 transition-colors mb-4">
                          {doc.title}
                        </h3>
                      </Link>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                            {doc.uploaderId?.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 leading-none">
                              {doc.uploaderId?.fullName}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(doc.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleAddToCollection(e, doc._id)}
                            className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                            title="Thêm vào bộ sưu tập"
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                            >
                              <path
                                d="M12 4L12 20M20 12L4 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-[11px] font-bold text-slate-900">
                              {doc.metrics?.viewCount || 0}
                            </span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                              Xem
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {showingAi ? "AI không tìm thấy tài liệu phù hợp" : "Không tìm thấy tài liệu"}
                  </p>
                  {showingAi ? (
                    <button onClick={() => { setShowingAi(false); setAiMode(false); }} className="mt-4 text-xs font-bold text-emerald-500 hover:underline">Quay lại danh sách</button>
                  ) : (
                    <button onClick={resetFilters} className="mt-4 text-xs font-bold text-emerald-500 hover:underline">Xóa tất cả bộ lọc</button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!showingAi && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>

                {getPageRange(currentPage, pagination.totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`gap-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-300 font-bold">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      aria-label={`Trang ${p}`}
                      aria-current={currentPage === p ? "page" : undefined}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                        currentPage === p
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  aria-label="Trang sau"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        materialId={selectedMaterialId}
      />
    </div>
  );
}
