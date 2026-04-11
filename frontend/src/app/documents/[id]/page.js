"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

// Mock data chi tiết cho một tài liệu (Sau này sẽ fetch từ API)
const mockDocDetail = {
  id: 1,
  title: "Đồ án ReactJS - Hệ thống Quản lý Thư viện số dành cho Sinh viên IT",
  category: "Lập trình Web",
  type: "Source Code",
  author: {
    name: "Nguyễn Minh Triết",
    role: "Sinh viên K27",
    avatar: "T",
    contributions: 12
  },
  views: 1205,
  downloads: 450,
  likes: 82,
  date: "12/05/2026",
  description: "Đây là đồ án kết thúc môn Lập trình Web nâng cao. Hệ thống được xây dựng bằng Next.js 14, TailwindCSS và Firebase cho phần xác thực & database. Các tính năng chính bao gồm: Tìm kiếm tài liệu thời gian thực, quản lý giỏ hàng tài liệu, dashboard cho admin duyệt bài và hệ thống bình luận đa cấp.",
  tags: ["Next.js", "Tailwind", "Firebase", "Web App", "Đồ án"],
  fileInfo: {
    name: "DigitalLibrary_Source.zip",
    size: "14.2 MB",
    format: "ZIP"
  },
  relatedDocs: [
    { id: 2, title: "Slide bài giảng: Thuật toán Dijkstra", type: "Slide", views: 850 },
    { id: 3, title: "100+ Bài tập Python nâng cao", type: "PDF", views: 3200 },
    { id: 4, title: "Docker for Beginners - VLU IT", type: "PDF", views: 120 }
  ]
};

export default function DocumentDetailPage() {
  const params = useParams();
  const [doc, setDoc] = useState(mockDocDetail);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // preview, info, comments

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20">
      {/* top Navigation */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/documents" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Quay lại Thư viện
          </Link>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-xl border transition-all ${isLiked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400 hover:text-red-500'}`}
             >
               <svg width="20" height="20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
             </button>
             <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all">
               <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Content (Left - 2/3) */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
            
            {/* Header Info */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]"></div>
               <div className="flex flex-wrap gap-3 mb-6 relative z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${doc.type === 'Source Code' ? 'bg-slate-900 text-white border-slate-900' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {doc.type}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10">
                    {doc.category}
                  </span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-8 relative z-10">{doc.title}</h1>
               
               <div className="flex flex-wrap items-center gap-8 text-slate-400 text-sm font-bold border-t border-slate-50 pt-8 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    {doc.views.toLocaleString()} lượt xem
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    {doc.downloads.toLocaleString()} lượt tải
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                    {doc.date}
                  </div>
               </div>
            </div>

            {/* Document Tabs & Content */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="flex border-b border-slate-50 px-8 pt-6">
                  {['preview', 'info', 'comments'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab === 'preview' ? 'Xem trước' : tab === 'info' ? 'Chi tiết' : 'Thảo luận'}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
                    </button>
                  ))}
               </div>
               
               <div className="p-8 md:p-12 min-h-[400px]">
                  {activeTab === 'preview' && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="aspect-[4/3] w-full bg-slate-100 rounded-[2rem] border border-slate-200 flex flex-col items-center justify-center text-center p-12 overflow-hidden relative group">
                         {/* Placeholder for actual viewer */}
                         <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                         </div>
                         <h3 className="text-xl font-bold text-slate-800 mb-2">Chế độ Xem nhanh</h3>
                         <p className="text-slate-500 font-medium max-w-sm">Duyệt qua các trang đầu tiên của tài liệu hoặc xem qua cấu trúc thư mục mã nguồn.</p>
                         
                         {/* Blurred background effect */}
                         <div className="absolute inset-x-12 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
                         <div className="absolute bottom-12 z-20">
                            <button className="px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Mở xem toàn màn hình</button>
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'info' && (
                    <div className="space-y-10 animate-fade-in">
                       <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Mô tả nội dung</h4>
                          <p className="text-slate-700 leading-loose font-medium text-lg italic border-l-4 border-primary/20 pl-6">{doc.description}</p>
                       </div>
                       <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Từ khóa liên quan</h4>
                          <div className="flex flex-wrap gap-2">
                             {doc.tags.map(tag => (
                               <span key={tag} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 hover:border-primary/20 hover:text-primary transition-all cursor-pointer">#{tag}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">B</div>
                          <div className="flex-1 space-y-4">
                             <textarea 
                              placeholder="Viết cảm nghĩ của bạn về tài liệu này..." 
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all resize-none"
                              rows="3"
                             ></textarea>
                             <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">Gửi bình luận</button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>

          </div>

          {/* Sidebar Area (Right - 1/3) */}
          <aside className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            
            {/* Download Card */}
            <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
               <h3 className="text-xl font-bold mb-6 relative z-10">Tải tài liệu về máy</h3>
               <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                           <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Định dạng</p>
                           <p className="text-sm font-bold">{doc.fileInfo.format}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Kích thước</p>
                        <p className="text-sm font-bold">{doc.fileInfo.size}</p>
                     </div>
                  </div>
               </div>
               <button className="w-full bg-white text-primary py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10">
                  <span>TẢI XUỐNG NGAY</span>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
               </button>
            </div>

            {/* Author Profile */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Người chia sẻ</h4>
               <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 border border-slate-200">
                    {doc.author.avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center border-4 border-white shadow-lg">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
               </div>
               <h3 className="text-xl font-black text-slate-800 mb-1">{doc.author.name}</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{doc.author.role}</p>
               <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đóng góp</p>
                    <p className="text-lg font-black text-slate-700">{doc.author.contributions}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Uy tín</p>
                    <p className="text-lg font-black text-emerald-500">9.8</p>
                  </div>
               </div>
               <button className="w-full mt-8 py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all">
                  Xem trang cá nhân
               </button>
            </div>

            {/* Related Documents */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Tài liệu liên quan</h4>
               <div className="space-y-6">
                  {doc.relatedDocs.map(item => (
                    <Link href={`/documents/${item.id}`} key={item.id} className="group flex items-start gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${item.type === 'Slide' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       </div>
                       <div>
                          <h5 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">{item.title}</h5>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.views} lượt xem</p>
                       </div>
                    </Link>
                  ))}
               </div>
               <button className="w-full mt-10 py-3.5 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all">
                  Xem tất cả
               </button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
