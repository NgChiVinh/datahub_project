"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [uploadType, setUploadType] = useState("file"); // 'file' or 'link'
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Lập trình Web");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Giả lập quá trình upload
    setTimeout(() => {
      setIsLoading(false);
      alert("Tài liệu đã được gửi để kiểm duyệt thành công!");
      // Reset form hoặc chuyển hướng
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/10 -z-10 blur-3xl opacity-50"></div>
      
      <div className="container mx-auto max-w-5xl px-4 pt-12 md:pt-20">
        <div className="mb-12 animate-fade-in">
          <Link href="/documents" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline mb-6">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Quay lại Thư viện
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Chia sẻ Tri thức</h1>
              <p className="text-slate-500 font-medium text-lg">Góp phần xây dựng cộng đồng IT Văn Lang ngày càng lớn mạnh.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setUploadType("file")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${uploadType === 'file' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Tải tệp lên
              </button>
              <button 
                onClick={() => setUploadType("link")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${uploadType === 'link' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Gửi đường dẫn
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-10 space-y-8">
                {/* section: Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                    <h3 className="font-bold text-slate-800">Thông tin cơ bản</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-1">Tiêu đề tài liệu <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Tổng hợp Lab 1 - Cấu trúc dữ liệu và giải thuật"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 ml-1">Chuyên mục <span className="text-red-500">*</span></label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-medium text-slate-700"
                      >
                        <option>Lập trình Web</option>
                        <option>DSA (Giải thuật)</option>
                        <option>Hệ điều hành</option>
                        <option>Mạng máy tính</option>
                        <option>Cơ sở dữ liệu</option>
                        <option>Đồ án / Khóa luận</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 ml-1">Năm học</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-medium text-slate-700">
                        <option>2023 - 2024</option>
                        <option>2024 - 2025</option>
                        <option>2022 - 2023</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* section: File Upload / Link */}
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                    <h3 className="font-bold text-slate-800">Tải lên nội dung</h3>
                  </div>

                  {uploadType === 'file' ? (
                    <div 
                      className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 py-12 px-6 flex flex-col items-center text-center gap-4 cursor-pointer
                        ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-50'}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => !file && fileInputRef.current.click()}
                    >
                      {!file ? (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 group-hover:scale-110 transition-transform">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-lg">Kéo thả hoặc click để chọn tệp</p>
                            <p className="text-slate-400 text-sm mt-1 font-medium">Hỗ trợ PDF, DOCX, ZIP, JPG (Tối đa 25MB)</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-primary/20 shadow-sm animate-fade-in">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          </div>
                          <div className="flex-1 text-left overflow-hidden">
                            <p className="font-bold text-slate-800 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng tải lên</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" onChange={handleChange} className="hidden" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 ml-1">Đường dẫn tài liệu <span className="text-red-500">*</span></label>
                      <input 
                        type="url" 
                        required
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* section: Description */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                    <h3 className="font-bold text-slate-800">Mô tả thêm</h3>
                  </div>
                  <textarea 
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Viết một vài dòng giới thiệu về nội dung tài liệu này để giúp người khác dễ dàng tìm kiếm..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:text-slate-400 font-medium"
                  ></textarea>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-medium max-w-xs italic">
                  Bằng cách nhấn "Gửi tài liệu", bạn đồng ý với các quy định về bản quyền và nội dung của cộng đồng.
                </p>
                <button 
                  disabled={isLoading || (!file && uploadType === 'file')}
                  className="bg-primary hover:brightness-110 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span>Gửi tài liệu</span>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2 uppercase tracking-tight">
                <svg className="text-highlight" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Quy định chia sẻ
              </h4>
              <ul className="space-y-5">
                {[
                  { title: "Nội dung chính xác", desc: "Đảm bảo tài liệu có tiêu đề rõ ràng, đúng chuyên mục." },
                  { title: "Bản quyền tri thức", desc: "Không chia sẻ các tài liệu vi phạm bản quyền hoặc thông tin mật." },
                  { title: "Chất lượng tệp", desc: "Khuyến khích định dạng PDF để có hiển thị tốt nhất trên web." },
                  { title: "Dung lượng tối đa", desc: "Tệp tải lên không nên vượt quá 25MB." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-bold text-sm text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-primary rounded-3xl p-8 text-white shadow-lg shadow-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10"></div>
              <h4 className="font-bold text-xl mb-3 relative z-10">Tài liệu của bạn sẽ được hiển thị như thế nào?</h4>
              <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium relative z-10">
                Sau khi gửi, đội ngũ quản trị sẽ kiểm duyệt nội dung trong vòng 24h trước khi chính thức xuất hiện trên thư viện cộng đồng.
              </p>
              <div className="w-full aspect-video bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm flex items-center justify-center">
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white/40"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
