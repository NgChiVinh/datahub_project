"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: "Xây dựng ứng dụng quản lý thư viện bằng Java Swing",
    subject: "Lập trình hướng đối tượng",
    difficulty: "Trung bình",
    author: "Nguyễn Văn Hùng",
    date: "12/04/2026",
    comments: 15,
    likes: 24,
    tags: ["Java", "Swing", "SQL Server"],
    status: "Đang thảo luận"
  },
  {
    id: 2,
    title: "Thiết kế Website bán hàng với Next.js & Tailwind CSS",
    subject: "Lập trình Web nâng cao",
    difficulty: "Khó",
    author: "Lê Thị Lan",
    date: "10/04/2026",
    comments: 42,
    likes: 56,
    tags: ["Next.js", "React", "Frontend"],
    status: "Đã có lời giải"
  },
  {
    id: 3,
    title: "Giải bài tập cấu trúc dữ liệu: Cây nhị phân tìm kiếm",
    subject: "Cấu trúc dữ liệu & Giải thuật",
    difficulty: "Dễ",
    author: "Phạm Minh Tuấn",
    date: "09/04/2026",
    comments: 8,
    likes: 12,
    tags: ["C++", "DSA", "Algorithm"],
    status: "Mới"
  },
  {
    id: 4,
    title: "Đồ án: Nhận diện khuôn mặt với Python & OpenCV",
    subject: "Xử lý ảnh",
    difficulty: "Rất khó",
    author: "Trần Bảo Nam",
    date: "08/04/2026",
    comments: 31,
    likes: 45,
    tags: ["Python", "AI", "OpenCV"],
    status: "Đang thảo luận"
  }
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState("Tất cả");

  const filteredAssignments = filter === "Tất cả" 
    ? MOCK_ASSIGNMENTS 
    : MOCK_ASSIGNMENTS.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              Góc Bài Tập & Đồ Án
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Nơi sinh viên chia sẻ đề bài, thảo luận cách giải và cùng nhau vượt qua các kỳ đồ án khó nhằn.
            </p>
          </div>
          
          <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Đăng bài mới
          </button>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {["Tất cả", "Mới", "Đang thảo luận", "Đã có lời giải"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssignments.map((item) => (
            <div key={item.id} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  item.status === "Đã có lời giải" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  item.status === "Đang thảo luận" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-600 border-slate-100"
                }`}>
                  {item.status}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[8px]">M</span>
                {item.subject}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {item.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-wider">#{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="text-xs font-black">{item.comments}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    <span className="text-xs font-black">{item.likes}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Người đăng</p>
                      <p className="text-[11px] font-black text-slate-700 uppercase">{item.author}</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                      {item.author[0]}
                   </div>
                </div>
              </div>
              
              {/* Difficulty Indicator */}
              <div className={`absolute top-0 right-0 w-2 h-full ${
                item.difficulty === "Rất khó" ? "bg-red-500" :
                item.difficulty === "Khó" ? "bg-orange-500" :
                item.difficulty === "Trung bình" ? "bg-blue-500" : "bg-emerald-500"
              }`} title={`Mức độ: ${item.difficulty}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
