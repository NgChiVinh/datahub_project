"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState("file"); 
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [youtubePreview, setYoutubePreview] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [majorId, setMajorId] = useState("");
  const [academicYear, setAcademicYear] = useState("Năm 1");
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [description, setDescription] = useState("");
  
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);

  const hotTags = ["#Lab", "#ĐồÁn", "#ThiCu", "#Slide"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes, majorRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`)
        ]);
        if (Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (Array.isArray(tagRes.data)) setAllTags(tagRes.data);
        if (Array.isArray(majorRes.data)) {
          setMajors(majorRes.data);
          if (majorRes.data.length > 0) setMajorId(majorRes.data[0]._id);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  // Lọc danh mục (Môn học) dựa trên Chuyên ngành đã chọn
  const filteredCategories = useMemo(() => {
    if (!majorId) return [];
    // Lọc các category có majorId khớp với majorId đang chọn
    return categories.filter(c => (c.majorId?._id || c.majorId) === majorId);
  }, [majorId, categories]);

  useEffect(() => {
    if (uploadType === "link" && link) {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = link.match(regExp);
      if (match && match[2].length === 11) {
        setYoutubePreview(`https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`);
      } else setYoutubePreview(null);
    } else setYoutubePreview(null);
  }, [link, uploadType]);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const addTag = (tag) => {
    if (!selectedTags.find(t => t._id === tag._id)) setSelectedTags([...selectedTags, tag]);
    setTagInput(""); setShowTagSuggestions(false);
  };

  const addHotTag = (tagName) => {
    const cleanName = tagName.replace("#", "");
    const existingTag = allTags.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
    if (existingTag) addTag(existingTag);
    else if (!selectedTags.find(t => t.name.toLowerCase() === cleanName.toLowerCase())) {
      setSelectedTags([...selectedTags, { _id: cleanName, name: cleanName }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tài liệu!");
      return;
    }
    if (!majorId) {
      toast.error("Vui lòng chọn chuyên ngành!");
      return;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn môn học!");
      return;
    }
    if (uploadType === "file" && !file) {
      toast.error("Vui lòng chọn tệp để tải lên!");
      return;
    }
    if (uploadType === "link" && !link.trim()) {
      toast.error("Vui lòng dán đường dẫn tài liệu!");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Đang tải tài liệu lên...");
    try {
      const token = localStorage.getItem("token");
      const tagIds = selectedTags.map(t => t._id);
      let res;
      if (uploadType === "file") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("majorId", majorId);
        formData.append("academicYear", academicYear);
        formData.append("file", file);
        formData.append("tags", JSON.stringify(tagIds));
        res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials`, formData, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials`,
          {
            title,
            description,
            categoryId,
            majorId,
            academicYear,
            link,
            tags: tagIds,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.status === 201 || res.status === 200) {
        toast.success("Tải lên thành công! Đang chờ kiểm duyệt.", { id: loadingToast });
        router.push("/documents");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải lên", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fcfcfd] font-sans text-slate-900 pb-12">
        <div className="container mx-auto max-w-6xl px-4 pt-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <Link href="/documents" className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3 hover:gap-3 transition-all">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                Thư viện
              </Link>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Đóng góp tài liệu</h1>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
              {['file', 'link'].map(type => (
                <button key={type} onClick={() => setUploadType(type)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${uploadType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {type === 'file' ? 'Tải tệp' : 'Gửi link'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="p-8 space-y-8">
                {/* Row 1: Title */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề tài liệu <span className="text-red-500">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Slide bài giảng Chương 1 - Java Core" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-5 py-3.5 focus:bg-white focus:border-emerald-500/20 outline-none transition-all font-bold text-sm shadow-inner" />
                </div>

                {/* Row 2: Dropdown Major Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn Chuyên ngành <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <select 
                      value={majorId} 
                      onChange={(e) => setMajorId(e.target.value)} 
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-5 py-4 focus:bg-white focus:border-emerald-500/20 outline-none cursor-pointer font-bold text-xs shadow-inner appearance-none transition-all"
                    >
                      <option value="" disabled>-- Chọn chuyên ngành --</option>
                      {majors.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.majorCode})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Môn học <span className="text-red-500">*</span></label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 focus:bg-white focus:border-emerald-500/20 outline-none cursor-pointer font-bold text-xs shadow-inner appearance-none">
                      <option value="">Chọn môn học...</option>
                      {filteredCategories.filter(c => !c.parentId).map(parent => (
                        <optgroup key={parent._id} label={parent.name}>
                          {filteredCategories.filter(c => (c.parentId?._id || c.parentId) === parent._id).map(sub => (
                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Học kỳ/Năm</label>
                    <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 focus:bg-white focus:border-emerald-500/20 outline-none cursor-pointer font-bold text-xs shadow-inner appearance-none">
                      {[{_id: "Năm 1", name: "Năm 1"}, {_id: "Năm 2", name: "Năm 2"}, {_id: "Năm 3", name: "Năm 3"}, {_id: "Năm 4", name: "Năm 4"}, {_id: "Khác", name: "Khác"}].map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3: Tags */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Từ khóa (Tags)</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border-2 border-slate-50 focus-within:bg-white focus-within:border-emerald-500/20 transition-all shadow-inner relative">
                    {selectedTags.map(tag => (
                      <span key={tag._id} className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2">
                        {tag.name}
                        <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t._id !== tag._id))}><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                      </span>
                    ))}
                    <input type="text" value={tagInput} onChange={(e) => {setTagInput(e.target.value); setShowTagSuggestions(true)}} onFocus={() => setShowTagSuggestions(true)} onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        const existing = allTags.find(t => t.name.toLowerCase() === tagInput.toLowerCase().trim());
                        if (existing) addTag(existing);
                        else setSelectedTags([...selectedTags, { _id: tagInput.trim(), name: tagInput.trim() }]);
                        setTagInput("");
                      }
                    }} placeholder="Thêm tag..." className="flex-1 bg-transparent border-none outline-none font-bold text-xs min-w-[100px]" />
                    
                    {showTagSuggestions && tagInput.trim() !== "" && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-32 overflow-y-auto p-1">
                        {allTags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase())).map(tag => (
                          <button key={tag._id} type="button" onClick={() => addTag(tag)} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase text-slate-600">{tag.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {hotTags.map(t => (
                      <button key={t} type="button" onClick={() => addHotTag(t)} className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-all uppercase tracking-tighter">{t}</button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Upload & Description Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pt-6 border-t border-slate-100">
                  <div className="md:col-span-3 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung tải lên <span className="text-red-500">*</span></label>
                    {uploadType === 'file' ? (
                      <div className={`relative rounded-2xl border-2 border-dashed h-40 flex flex-col items-center justify-center text-center p-4 transition-all cursor-pointer ${dragActive ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !file && fileInputRef.current.click()}>
                        {!file ? (
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 mx-auto border border-slate-50"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg></div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kéo thả tệp vào đây</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-500/20 shadow-sm w-full">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>
                            <p className="flex-1 text-[10px] font-black truncate uppercase text-slate-700">{file.name}</p>
                            <button type="button" onClick={(e) => {e.stopPropagation(); setFile(null)}} className="p-2 text-slate-300 hover:text-red-500"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dán link (YouTube, Drive...)" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 focus:bg-white focus:border-emerald-500/20 outline-none font-bold text-xs shadow-inner" />
                        {youtubePreview && (
                          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-white animate-in zoom-in-95">
                            <img src={youtubePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-red-600"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="m7 4 12 8-12 8V4Z"/></svg></div></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                    <textarea rows={uploadType === 'link' && youtubePreview ? 8 : 6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Giới thiệu nhanh tài liệu..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500/20 outline-none transition-all resize-none font-bold text-xs shadow-inner"></textarea>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Dữ liệu được bảo vệ an toàn trên hệ thống</span>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-4 px-10 rounded-xl shadow-xl transition-all active:scale-[0.95] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[10px]"
                >
                  {isLoading ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : "Gửi tài liệu ngay"}
                  {!isLoading && <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                <h4 className="font-black text-slate-900 text-sm mb-6 uppercase tracking-tighter italic flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  Quy định nhanh
                </h4>
                <div className="space-y-6">
                  {[
                    { t: "Đúng ngành", d: "Chọn đúng ngành và chuyên mục để SV khác dễ tìm." },
                    { t: "Bản quyền", d: "Không đăng tài liệu mật hoặc vi phạm bản quyền." },
                    { t: "Định dạng", d: "Khuyên dùng PDF hoặc Link Video chuẩn." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                      <div>
                        <p className="font-black text-[10px] text-slate-800 uppercase mb-1">{item.t}</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </ProtectedRoute>
  );
}
