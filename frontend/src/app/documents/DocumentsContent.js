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
  const [activeYear, setActiveYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

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

  // 1. Lấy dữ liệu ban đầu và đồng bộ từ URL
  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || "all";
    const initialMajor = searchParams.get("major") || "all";

    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCategory !== "all") setActiveCategory(initialCategory);
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
  }, [activeCategory, activeMajor, activeYear, searchQuery, sortBy]);

  // 2. Fetch Materials dựa trên bộ lọc và sắp xếp
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("materialType", "not_video");
        params.append("page", currentPage);
        params.append("limit", 8);
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (activeMajor !== "all") params.append("major", activeMajor);
        if (activeYear !== "all") params.append("academicYear", activeYear);
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
  }, [
    activeCategory,
    activeMajor,
    activeYear,
    searchQuery,
    sortBy,
    currentPage,
  ]);

  const fileTypes = [
    { id: "all", name: "Tất cả định dạng" },
    { id: "pdf", name: "Tài liệu PDF" },
    { id: "docx", name: "Văn bản Word" },
    { id: "pptx", name: "Slide Bài giảng" },
    { id: "zip", name: "File nén (Zip/Rar)" },
  ];

  const [activeType, setActiveType] = useState("all");

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
    setActiveYear("all");
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
  }, [
    activeCategory,
    activeMajor,
    activeType,
    searchQuery,
    sortBy,
    currentPage,
  ]);

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
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
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
                  d="M12 4v16m8-8H4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                  placeholder="Tìm tài liệu theo môn học, tiêu đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium"
                />
              </div>

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

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-2xl h-64 animate-pulse"
                  ></div>
                ))
              ) : materials.length > 0 ? (
                materials.map((doc) => (
                  <div
                    key={doc._id}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
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
                    Không tìm thấy tài liệu
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-xs font-bold text-emerald-500 hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
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

      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        materialId={selectedMaterialId}
      />
    </div>
  );
}
