"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCollectionModal from "@/components/AddToCollectionModal";

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMaterials: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [majors, setMajors] = useState([]);
  const [activeMajor, setActiveMajor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const handleAddToCollection = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVideoId(id);
    setIsCollectionModalOpen(true);
  };

  const logClick = async (materialId, materialTitle) => {
    if (!searchQuery.trim()) return; // Chỉ log khi người dùng có thực hiện tìm kiếm

    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/search-logs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ 
          searchQuery: searchQuery.trim(),
          clickedMaterialId: materialId 
        }),
      });
    } catch (err) {
      console.error("Lỗi log click:", err);
    }
  };

  // Lấy danh mục (Majors)
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`);
        const data = await res.json();
        if (Array.isArray(data)) setMajors(data);
      } catch (error) {
        console.error("Lỗi lấy chuyên ngành:", error);
      }
    };
    fetchMajors();
  }, []);

  // Fetch video với đầy đủ bộ lọc
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("materialType", "video");
        params.append("page", currentPage);
        params.append("limit", 9); // 3x3 grid
        if (activeMajor !== "all") params.append("major", activeMajor);
        if (searchQuery) params.append("search", searchQuery);
        if (sortBy !== "newest") params.append("sortBy", sortBy);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials?${params.toString()}`);
        const data = await res.json();

        if (data && data.materials) {
          setVideos(data.materials);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu video:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchVideos, 400);
    return () => clearTimeout(timeoutId);
  }, [activeMajor, searchQuery, sortBy, currentPage]);

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [activeMajor, searchQuery, sortBy]);

  const resetFilters = () => {
    setActiveMajor("all");
    setSearchQuery("");
  };

  const hasFilters = activeMajor !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Compact Header */}
      <section className="bg-slate-50/50 border-b border-slate-100 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                <span>/</span>
                <span className="text-slate-600">Video bài giảng</span>
              </nav>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thư viện <span className="text-orange-500">Video</span></h1>
            </div>
            <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 text-white rounded-2xl text-xs font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-100">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Đóng góp video
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-28 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Chuyên ngành</h3>
                  {hasFilters && (
                    <button onClick={resetFilters} className="text-[10px] font-bold text-orange-400 hover:underline">Xóa lọc</button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveMajor("all")}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeMajor === "all"
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Tất cả video
                  </button>

                  {majors.map((major) => (
                    <button
                      key={major._id}
                      onClick={() => setActiveMajor(major._id)}
                      className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        activeMajor === major._id
                          ? "text-orange-500 bg-orange-50"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {major.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                <div className="w-10 h-10 bg-orange-100/20 rounded-xl flex items-center justify-center mb-4">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="text-orange-400"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight mb-2">Học tập trực quan</h4>
                <p className="text-slate-400 text-[10px] leading-relaxed font-medium">Video bài giảng giúp bạn tiếp thu kiến thức nhanh hơn 40% so với đọc tài liệu thông thường.</p>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400 transition-colors">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài giảng video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-orange-200 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="flex p-1 bg-slate-100 rounded-2xl">
                {[{id:"newest", name:"Mới nhất"}, {id:"most_viewed", name:"Xem nhiều"}].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-6 py-3 rounded-[0.8rem] text-[10px] font-bold uppercase tracking-widest transition-all ${
                      sortBy === s.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl aspect-[16/14] animate-pulse"></div>
                ))
              ) : videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video._id} className="group bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col h-full overflow-hidden">
                    {/* Thumbnail Container */}
                    <Link 
                      href={`/videos/${video._id}`} 
                      className="block relative aspect-video overflow-hidden bg-slate-900"
                      onClick={() => logClick(video._id, video.title)}
                    >
                      <Image 
                        src={video.sourceType === 'link' && video.fileUrl.includes('youtube.com') 
                          ? `https://img.youtube.com/vi/${video.fileUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`
                          : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} 
                        alt={video.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" 
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                         <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[8px] font-bold text-slate-800 uppercase border border-white">
                          {video.majorId?.name || "Chung"}
                        </span>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="m7 4 12 8-12 8V4z"/></svg>
                        </div>
                      </div>

                      {/* View Count Overlay */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 text-[8px] font-bold text-white uppercase tracking-widest">
                        {video.metrics?.viewCount || 0} views
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-2 truncate">
                        {video.categoryId?.name || "Bài giảng"}
                      </p>
                      
                      <Link 
                        href={`/videos/${video._id}`}
                        onClick={() => logClick(video._id, video.title)}
                      >
                        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 hover:text-orange-500 transition-colors mb-6">
                          {video.title}
                        </h3>
                      </Link>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                            {video.uploaderId?.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 leading-none">{video.uploaderId?.fullName}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{new Date(video.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={(e) => handleAddToCollection(e, video._id)}
                             className="p-2 text-slate-300 hover:text-orange-500 transition-colors"
                             title="Thêm vào bộ sưu tập"
                           >
                              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                 <path d="M12 4L12 20M20 12L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </button>
                           <div className="flex items-center gap-1.5 text-slate-300">
                              <span className="text-[11px] font-bold text-slate-900">{video.metrics?.viewCount || 0}</span>
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Xem</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hiện chưa có video nào</p>
                  <button onClick={resetFilters} className="mt-4 text-xs font-bold text-orange-400 hover:underline">Xóa tất cả bộ lọc</button>
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
        materialId={selectedVideoId}
      />
    </div>
  );
}

