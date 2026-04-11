"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const MOCK_COURSES = [
  { 
    id: 1, 
    title: "Lập trình Next.js 14 Nâng Cao", 
    instructor: "ThS. Trần Văn A", 
    lessons: 12, 
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
    category: "Lập trình Web",
    views: "1.2k"
  },
  { 
    id: 2, 
    title: "Cấu trúc dữ liệu và Giải thuật", 
    instructor: "TS. Lê Thị B", 
    lessons: 25, 
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    category: "Cơ sở ngành",
    views: "3.5k"
  },
  { 
    id: 3, 
    title: "Xây dựng AI với Python", 
    instructor: "Nguyễn Văn C", 
    lessons: 18, 
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    category: "AI & Data Science",
    views: "2.8k"
  },
  { 
    id: 4, 
    title: "Thiết kế UI/UX hiện đại", 
    instructor: "Phạm Minh D", 
    lessons: 10, 
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80",
    category: "Design",
    views: "950"
  },
  { 
    id: 5, 
    title: "Bảo mật hệ thống thông tin", 
    instructor: "Hoàng Văn E", 
    lessons: 22, 
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    category: "An toàn thông tin",
    views: "1.5k"
  },
  { 
    id: 6, 
    title: "Lập trình hướng đối tượng (OOP)", 
    instructor: "Đặng Thị F", 
    lessons: 15, 
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    category: "Lập trình C++",
    views: "4.2k"
  }
];

export default function VideoGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const categories = ["Tất cả", "Lập trình Web", "Cơ sở ngành", "AI & Data Science", "Design"];

  const filteredCourses = selectedCategory === "Tất cả" 
    ? MOCK_COURSES 
    : MOCK_COURSES.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Kho Bài Giảng Video
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-10 text-lg">
            Học tập mọi lúc mọi nơi với hàng trăm video bài giảng chất lượng cao từ các giảng viên giàu kinh nghiệm.
          </p>
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                  {course.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">
                  {course.lessons} BÀI HỌC
                </div>
                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#10b981"><path d="m7 4 12 8-12 8V4z"/></svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.instructor}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors">
                  {course.title}
                </h3>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.views} lượt xem</span>
                  </div>
                  <Link 
                    href={`/videos/${course.id}`}
                    className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest hover:gap-3 transition-all"
                  >
                    Xem bài giảng
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
