"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState("file"); // 'file' or 'link'
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [academicYear, setAcademicYear] = useState("Năm 1");
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  
  // Tag States
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);

  // Lấy danh mục và tags từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/tags")
        ]);
        
        const catData = await catRes.json();
        const tagData = await tagRes.json();
        
        if (Array.isArray(catData)) {
          setCategories(catData);
          if (catData.length > 0) setCategoryId(catData[0]._id);
        }
        
        if (Array.isArray(tagData)) {
          setAllTags(tagData);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

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

  // Tag Handlers
  const addTag = (tag) => {
    if (!selectedTags.find(t => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t._id !== tagId));
  };

  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.find(st => st._id === tag._id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để upload tài liệu!");
        router.push("/login");
        return;
      }

      let res;
      const headers = {
        "Authorization": `Bearer ${token}`
      };

      // Chuẩn bị danh sách ID của các tag đã chọn
      const tagIds = selectedTags.map(t => t._id);

      if (uploadType === "file") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("academicYear", academicYear);
        formData.append("file", file);
        formData.append("tags", JSON.stringify(tagIds)); // Gửi mảng ID

        res = await fetch("http://localhost:5000/api/materials", {
          method: "POST",
          headers: headers,
          body: formData
        });
      } else {
        const body = {
          title,
          description,
          categoryId,
          academicYear,
          link,
          tags: tagIds // Gửi mảng ID
        };

        res = await fetch("http://localhost:5000/api/materials", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert("Tài liệu đã được gửi để kiểm duyệt thành công!");
        router.push("/documents");
      } else {
        alert(`Lỗi: ${data.message || "Không thể tải lên tài liệu"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi kết nối đến server. Vui lòng kiểm tra lại backend!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
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
                <p className="text-slate-500 font-medium text-lg">Góp phần xây dựng cộng đồng IT Văn Lang.</p>
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
            <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 md:p-10 space-y-8">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Chuyên mục <span className="text-red-500">*</span></label>
                        <select 
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-medium text-slate-700"
                        >
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Năm học <span className="text-red-500">*</span></label>
                        <select 
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-medium text-slate-700"
                        >
                          <option value="Năm 1">Năm 1</option>
                          <option value="Năm 2">Năm 2</option>
                          <option value="Năm 3">Năm 3</option>
                          <option value="Năm 4">Năm 4</option>
                        </select>
                      </div>
                    </div>

                    {/* Tag Picker UI */}
                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-slate-600 ml-1">Từ khóa (Tags)</label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                          <span key={tag._id} className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                            {tag.name}
                            <button type="button" onClick={() => removeTag(tag._id)} className="hover:text-red-200 transition-colors">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input 
                          ref={tagInputRef}
                          type="text" 
                          value={tagInput}
                          onChange={(e) => {
                            setTagInput(e.target.value);
                            setShowTagSuggestions(true);
                          }}
                          onFocus={() => setShowTagSuggestions(true)}
                          placeholder={selectedTags.length === 0 ? "Chọn hoặc gõ để tìm tag..." : ""}
                          className="flex-1 bg-transparent border-none outline-none font-medium text-sm min-w-[120px]"
                        />
                      </div>
                      
                      {/* Gợi ý Tag Dropdown */}
                      {showTagSuggestions && tagInput.trim() !== "" && (
                        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2">
                          {filteredTags.length > 0 ? (
                            filteredTags.map(tag => (
                              <button
                                key={tag._id}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between"
                              >
                                {tag.name}
                                <svg className="text-slate-300" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Không tìm thấy tag phù hợp</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

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
                        <label className="text-sm font-bold text-slate-600 ml-1">Đường dẫn tài liệu (YouTube, Drive...) <span className="text-red-500">*</span></label>
                        <input 
                          type="url" 
                          required
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                      <h3 className="font-bold text-slate-800">Mô tả thêm</h3>
                    </div>
                    <textarea 
                      rows="4"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Viết một vài dòng giới thiệu về nội dung tài liệu này..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none font-medium"
                    ></textarea>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 font-medium max-w-xs italic">
                    Tài liệu sẽ được quản trị viên kiểm duyệt trước khi hiển thị.
                  </p>
                  <button 
                    disabled={isLoading || (uploadType === 'file' && !file) || (uploadType === 'link' && !link)}
                    className="bg-primary hover:brightness-110 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-3 shrink-0"
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
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
