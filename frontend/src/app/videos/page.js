"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh mục và video
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("materialType", "video");
        params.append("page", currentPage);
        params.append("limit", 6);
        if (activeMajor !== "all") params.append("major", activeMajor);

        const [majorRes, videoRes] = await Promise.all([
          fetch("http://localhost:5000/api/majors"),
          fetch(`http://localhost:5000/api/materials?${params.toString()}`)
        ]);

        const majorData = await majorRes.json();
        const videoData = await videoRes.json();

        if (Array.isArray(majorData)) setMajors([{ _id: "all", name: "Tất cả chuyên ngành" }, ...majorData]);

        if (videoData && videoData.materials) {
          setVideos(videoData.materials);
          setPagination(videoData.pagination);
        } else if (Array.isArray(videoData)) {
          // Fallback cho client-side pagination nếu server chưa restart
          const itemsPerPage = 6;
          const total = videoData.length;
          const startIndex = (currentPage - 1) * itemsPerPage;
          setVideos(videoData.slice(startIndex, startIndex + itemsPerPage));
          setPagination({
            currentPage: currentPage,
            totalPages: Math.ceil(total / itemsPerPage),
            totalMaterials: total
          });
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu video:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeMajor, currentPage]);

  // Reset về trang 1 khi đổi chuyên ngành
  useEffect(() => {
    setCurrentPage(1);
  }, [activeMajor]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-16">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">
            Kho Bài Giảng Video
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-10 text-lg">
            Học tập mọi lúc mọi nơi với hàng trăm video bài giảng chất lượng cao từ cộng đồng sinh viên VLU IT.
          </p>
          
          {/* Majors Filter */}
          <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto overflow-x-auto no-scrollbar pb-2">
            {majors.map((m) => (
              <button
                key={m._id}
                onClick={() => setActiveMajor(m._id)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeMajor === m._id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Đang tải kho bài giảng...</p>
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <Image 
                      src={video.sourceType === 'link' && video.fileUrl.includes('youtube.com') 
                        ? `https://img.youtube.com/vi/${video.fileUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`
                        : "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80"} 
                      alt={video.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                      {video.majorId?.name || video.categoryId?.name}
                    </div>
                    
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="m7 4 12 8-12 8V4z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {video.uploaderId?.fullName?.charAt(0)}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{video.uploaderId?.fullName}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{video.metrics?.viewCount} lượt xem</span>
                      </div>
                      <Link 
                        href={`/videos/${video._id}`}
                        className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
                      >
                        Học ngay
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16 animate-fade-in">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 transition-all shadow-sm"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all shadow-sm ${
                      currentPage === i + 1
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 transition-all shadow-sm"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Hiện chưa có video bài giảng nào...</h3>
            <Link href="/upload" className="inline-block mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">Đóng góp video đầu tiên</Link>
          </div>
        )}
      </div>
    </div>
  );
}
