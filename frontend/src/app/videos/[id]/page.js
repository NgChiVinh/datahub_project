"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Dữ liệu mẫu (sau này lấy từ API dựa trên ID)
const MOCK_VIDEOS = [
  { 
    id: 1, 
    title: "Bài 1: Khởi tạo Project & Folder Structure", 
    duration: "15:30", 
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
    description: "Hướng dẫn chi tiết cách khởi tạo một dự án Next.js 14 với cấu trúc thư mục chuẩn SEO và hiệu năng cao.",
  },
  { 
    id: 2, 
    title: "Bài 2: Server Component vs Client Component", 
    duration: "22:15", 
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
    description: "Phân tích sự khác biệt giữa Server Component và Client Component trong Next.js App Router.",
  },
  { 
    id: 3, 
    title: "Bài 3: Data Fetching với Server Action", 
    duration: "18:45", 
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    description: "Cách lấy dữ liệu hiệu quả và bảo mật sử dụng Server Action trong Next.js.",
  },
];

export default function VideoWatchPage() {
  const { id } = useParams();
  const [activeVideo, setActiveVideo] = useState(MOCK_VIDEOS[0]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Video Player */}
          <div className="xl:col-span-8 space-y-8">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border-4 border-white">
               <Image src={activeVideo.thumbnail} alt={activeVideo.title} fill className="object-cover opacity-60" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="m7 4 12 8-12 8V4z"/></svg>
                  </div>
               </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100">
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">{activeVideo.title}</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{activeVideo.description}</p>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Tiếp theo</h3>
              <div className="space-y-4">
                {MOCK_VIDEOS.map((video) => (
                  <button key={video.id} onClick={() => setActiveVideo(video)} className={`w-full flex gap-4 p-3 rounded-3xl transition-all ${activeVideo.id === video.id ? "bg-slate-50 border-2 border-emerald-500/20" : "hover:bg-slate-50"}`}>
                    <div className="relative w-20 h-14 shrink-0 rounded-xl overflow-hidden">
                      <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
                    </div>
                    <div className="text-left">
                      <h4 className={`text-[10px] font-black uppercase leading-tight mb-1 ${activeVideo.id === video.id ? "text-emerald-600" : "text-slate-800"}`}>{video.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400">{video.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
