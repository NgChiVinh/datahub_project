"use client";

import { useState } from "react";

export default function UploadPage() {
  const [uploadType, setUploadType] = useState("file"); // 'file' or 'link'
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 py-16 font-sans">
      <div className="container mx-auto max-w-3xl px-4">
        
        {/* Tiêu đề trang */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Chia sẻ tri thức</h1>
          <p className="text-slate-500 font-medium">Đóng góp tài liệu của bạn cho cộng đồng IT</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
          <form className="space-y-8">
            
            {/* 1. Tiêu đề tài liệu */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề tài liệu</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Đồ án cuối kỳ môn Lập trình Web - K27"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
              />
            </div>

            {/* 2. Chọn Môn học & Loại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Môn học</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                  <option>Lập trình Web</option>
                  <option>Cấu trúc dữ liệu & Giải thuật</option>
                  <option>Trí tuệ nhân tạo</option>
                  <option>Mạng máy tính</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hình thức chia sẻ</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setUploadType("file")}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${uploadType === 'file' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                  >
                    FILE PDF/VIDEO
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUploadType("link")}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${uploadType === 'link' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                  >
                    LINK GITHUB
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Khu vực Upload File hoặc Nhập Link (Conditional Rendering) */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                {uploadType === 'file' ? 'Tệp đính kèm' : 'Đường dẫn mã nguồn'}
              </label>

              {uploadType === 'file' ? (
                <div 
                  className={`relative group h-64 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer
                    ${dragActive ? 'border-primary bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-700">Kéo thả file vào đây</p>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Hoặc bấm để chọn từ máy tính (Tối đa 20MB)</p>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://github.com/user/repository"
                    className="w-full pl-16 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              )}
            </div>

            {/* 4. Mô tả */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả tài liệu</label>
              <textarea 
                rows="4"
                placeholder="Chia sẻ một chút về nội dung hoặc cách sử dụng tài liệu này..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700"
              ></textarea>
            </div>

            {/* Nút Gửi */}
            <button className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              Đăng tài liệu ngay
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}