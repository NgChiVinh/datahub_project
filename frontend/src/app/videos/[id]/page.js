"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VideoWatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy dữ liệu video chi tiết
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:5000/api/materials/${id}`);
        const data = await res.json();
        setVideo(data);

        // Lấy video liên quan (cùng category)
        if (data.categoryId?._id) {
          const relatedRes = await fetch(`http://localhost:5000/api/materials?materialType=video&category=${data.categoryId._id}`);
          const relatedData = await relatedRes.json();
          setRelatedVideos(relatedData.filter(v => v._id !== id));
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu video:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchVideoData();
  }, [id]);

  // Hàm xử lý link YouTube sang mã nhúng
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!video) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-4">Không tìm thấy video</h2>
        <Link href="/videos" className="text-primary hover:underline font-bold uppercase text-xs tracking-widest">Quay lại kho video</Link>
      </div>
    </div>
  );

  const isYouTube = video.fileUrl?.includes("youtube.com") || video.fileUrl?.includes("youtu.be");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-20">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">
            <Link href="/videos" className="hover:text-primary transition-colors">Kho video</Link>
            <span>/</span>
            <span className="text-primary">{video.categoryId?.name}</span>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Video Player Area */}
          <div className="xl:col-span-8 space-y-8">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border-4 border-white">
               {isYouTube ? (
                 <iframe 
                   src={getEmbedUrl(video.fileUrl)}
                   className="absolute inset-0 w-full h-full"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 ></iframe>
               ) : (
                 <video 
                   src={video.fileUrl} 
                   controls 
                   className="absolute inset-0 w-full h-full object-contain"
                   autoPlay
                 ></video>
               )}
            </div>
            
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {video.categoryId?.name}
                </span>
                <span className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                  {video.academicYear}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-6 italic leading-tight">
                {video.title}
              </h1>
              
              <div className="flex items-center justify-between py-6 border-y border-slate-50 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                    {video.uploaderId?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{video.uploaderId?.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người đóng góp</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                   <div className="text-center">
                      <p className="text-sm font-black text-slate-800">{video.metrics?.viewCount?.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Lượt xem</p>
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-black text-emerald-500">{video.metrics?.averageRating || 0}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Đánh giá</p>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Mô tả bài học</h3>
                <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-emerald-500/20 pl-6 text-lg">
                  {video.description || "Không có mô tả chi tiết cho bài giảng này."}
                </p>
              </div>
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center justify-between">
                Video cùng mục
                <span className="h-px flex-1 bg-slate-50 ml-4"></span>
              </h3>
              <div className="space-y-6">
                {relatedVideos.length > 0 ? relatedVideos.map((item) => (
                  <Link href={`/videos/${item._id}`} key={item._id} className="group flex gap-4 transition-all">
                    <div className="relative w-28 h-16 shrink-0 rounded-2xl overflow-hidden bg-slate-900 shadow-sm group-hover:shadow-lg transition-all">
                      <Image 
                        src={item.sourceType === 'link' && item.fileUrl.includes('youtube.com') 
                          ? `https://img.youtube.com/vi/${item.fileUrl.split('v=')[1]?.split('&')[0]}/default.jpg`
                          : "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&q=80"} 
                        alt={item.title} 
                        fill 
                        className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="m7 4 12 8-12 8V4z"/></svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black text-slate-800 uppercase leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.metrics?.viewCount} views</p>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Không còn video liên quan</p>
                  </div>
                )}
              </div>
              
              <Link href="/videos" className="block w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-xl shadow-slate-900/20 hover:bg-primary transition-all">
                Xem toàn bộ kho video
              </Link>
            </div>

            {/* Support Info */}
            <div className="bg-emerald-500 rounded-[3rem] p-8 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
               <h4 className="text-lg font-black uppercase italic tracking-tight mb-4 relative z-10">Tài liệu đính kèm?</h4>
               <p className="text-white/80 text-[11px] font-bold leading-relaxed mb-6 relative z-10">Bạn có thể tìm thấy slide bài giảng và mã nguồn của video này trong phần Thư viện Tài liệu.</p>
               <Link href="/documents" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-emerald-600 px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                  Đến Thư viện
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
