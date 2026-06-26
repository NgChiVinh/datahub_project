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
  const suggestedTags = useMemo(() => allTags.slice(0, 8), [allTags]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes, majorRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`),
        ]);
        if (Array.isArray(catRes.data)) setCategories(catRes.data);
        if (Array.isArray(tagRes.data)) setAllTags(tagRes.data);
        if (Array.isArray(majorRes.data)) {
          setMajors(majorRes.data);
          if (majorRes.data.length > 0) setMajorId(majorRes.data[0]._id);
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!majorId) return [];
    return categories.filter((c) => (c.majorId?._id || c.majorId) === majorId);
  }, [majorId, categories]);

  useEffect(() => {
    if (uploadType === "link" && link) {
      const match = link.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match && match[2].length === 11)
        setYoutubePreview(`https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`);
      else setYoutubePreview(null);
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
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };
  const addTag = (tag) => {
    if (!selectedTags.find((t) => t._id === tag._id)) setSelectedTags([...selectedTags, tag]);
    setTagInput(""); setShowTagSuggestions(false);
  };
  const removeTag = (id) => setSelectedTags(selectedTags.filter((t) => t._id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề!"); return; }
    if (!majorId) { toast.error("Vui lòng chọn chuyên ngành!"); return; }
    if (!categoryId) { toast.error("Vui lòng chọn môn học!"); return; }
    if (uploadType === "file" && !file) { toast.error("Vui lòng chọn tệp!"); return; }
    if (uploadType === "link" && !link.trim()) { toast.error("Vui lòng dán link!"); return; }
    setIsLoading(true);
    const tid = toast.loading("Đang tải lên...");
    try {
      const token = localStorage.getItem("token");
      const tagIds = selectedTags.map((t) => t._id);
      let res;
      if (uploadType === "file") {
        const fd = new FormData();
        fd.append("title", title); fd.append("description", description);
        fd.append("categoryId", categoryId); fd.append("majorId", majorId);
        fd.append("academicYear", academicYear); fd.append("file", file);
        fd.append("tags", JSON.stringify(tagIds));
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials`, fd,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials`,
          { title, description, categoryId, majorId, academicYear, link, tags: tagIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (res.status === 201 || res.status === 200) {
        toast.success("Tải lên thành công!", { id: tid });
        router.push("/documents");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tải lên", { id: tid });
    } finally { setIsLoading(false); }
  };

  const step1Done = uploadType === "file" ? !!file : !!link;
  const step2Done = !!title && !!majorId && !!categoryId;
  const step3Done = selectedTags.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">

        {/* ── HEADER ── */}
        <section className="bg-slate-50/50 border-b border-slate-100 py-10">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Link href="/" className="hover:text-emerald-500 transition-colors">Trang chủ</Link>
                  <span>/</span>
                  <Link href="/documents" className="hover:text-emerald-500 transition-colors">Thư viện</Link>
                  <span>/</span>
                  <span className="text-slate-600">Đóng góp</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Đóng góp <span className="text-emerald-500">tài liệu</span>
                </h1>
                <p className="text-sm text-slate-500">
                  Chia sẻ tài nguyên học tập với cộng đồng sinh viên.
                </p>
              </div>

              {/* Type toggle — pill style */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start lg:self-auto">
                <button type="button" onClick={() => setUploadType("file")}
                  className={"px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all " +
                    (uploadType === "file" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  Tải tệp lên
                </button>
                <button type="button" onClick={() => setUploadType("link")}
                  className={"px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all " +
                    (uploadType === "link" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  Gửi link
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="container mx-auto max-w-6xl px-6 pt-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-8 items-start">

              {/* ── LEFT ── */}
              <div className="space-y-5">

                {/* STEP 1 */}
                <div className={`rounded-2xl border bg-white overflow-hidden transition-all ${step1Done ? "border-emerald-200 shadow-emerald-500/5 shadow-md" : "border-slate-100 shadow-sm"}`}>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
                    <StepBadge n="1" done={step1Done} />
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        {uploadType === "file" ? "Chọn tệp tài liệu" : "Dán link tài liệu"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {uploadType === "file" ? "PDF, DOCX, PPTX — tối đa 50MB" : "YouTube, Google Drive, OneDrive..."}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    {uploadType === "file" ? (
                      !file ? (
                        <div
                          onClick={() => fileInputRef.current.click()}
                          onDragEnter={handleDrag} onDragLeave={handleDrag}
                          onDragOver={handleDrag} onDrop={handleDrop}
                          className={"group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 " +
                            (dragActive ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20")}>
                          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                            <div className={"w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 " +
                              (dragActive ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-white border border-slate-100 shadow-sm text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-100 group-hover:shadow-emerald-100")}>
                              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                            </div>
                            <p className="text-sm font-bold text-slate-600 mb-1">
                              {dragActive ? "Thả tệp vào đây" : "Kéo thả hoặc nhấn để chọn tệp"}
                            </p>
                            <p className="text-xs text-slate-400 mb-4">Chọn từ máy tính của bạn</p>
                            <div className="flex gap-2">
                              {["PDF", "DOCX", "PPTX"].map((ext) => (
                                <span key={ext} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-wider shadow-sm">{ext}</span>
                              ))}
                            </div>
                          </div>
                          <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                            <p className="text-xs text-emerald-600 mt-0.5 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB · Sẵn sàng tải lên</p>
                          </div>
                          <button type="button" onClick={() => setFile(null)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="space-y-3">
                        <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... hoặc Google Drive..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                        {youtubePreview && (
                          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100">
                            <img src={youtubePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                                <svg width="20" height="20" fill="#ef4444" viewBox="0 0 24 24"><path d="m7 4 12 8-12 8V4Z" /></svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2 */}
                <div className={`rounded-2xl border bg-white overflow-hidden transition-all ${step2Done ? "border-emerald-200 shadow-emerald-500/5 shadow-md" : "border-slate-100 shadow-sm"}`}>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
                    <StepBadge n="2" done={step2Done} />
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Thông tin tài liệu</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Điền đầy đủ để sinh viên dễ tìm kiếm</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">

                    <div>
                      <FieldLabel>Tiêu đề <span className="text-rose-400">*</span></FieldLabel>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Slide bài giảng Chương 1 — Java Core"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                    </div>

                    <div>
                      <FieldLabel>Chuyên ngành <span className="text-rose-400">*</span></FieldLabel>
                      <div className="relative">
                        <select value={majorId} onChange={(e) => setMajorId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all">
                          <option value="" disabled>Chọn chuyên ngành...</option>
                          {majors.map((m) => (
                            <option key={m._id} value={m._id}>{m.name} ({m.majorCode})</option>
                          ))}
                        </select>
                        <ChevronDown />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Môn học <span className="text-rose-400">*</span></FieldLabel>
                        <div className="relative">
                          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all">
                            <option value="">Chọn môn học...</option>
                            {filteredCategories.filter((c) => !c.parentId).map((parent) => (
                              <optgroup key={parent._id} label={parent.name}>
                                {filteredCategories
                                  .filter((c) => (c.parentId?._id || c.parentId) === parent._id)
                                  .map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <ChevronDown />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Năm học</FieldLabel>
                        <div className="relative">
                          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all">
                            <option value="Năm 1">Năm 1</option>
                            <option value="Năm 2">Năm 2</option>
                            <option value="Năm 3">Năm 3</option>
                            <option value="Năm 4">Năm 4</option>
                            <option value="Khác">Khác</option>
                          </select>
                          <ChevronDown />
                        </div>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Mô tả ngắn</FieldLabel>
                      <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Giới thiệu ngắn về nội dung tài liệu..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-none" />
                    </div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className={`rounded-2xl border bg-white overflow-hidden transition-all ${step3Done ? "border-emerald-200 shadow-emerald-500/5 shadow-md" : "border-slate-100 shadow-sm"}`}>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
                    <StepBadge n="3" done={step3Done} />
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Từ khóa & tag</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Giúp tài liệu xuất hiện trong kết quả tìm kiếm</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      <div className="flex flex-wrap gap-1.5 p-3 min-h-[52px] bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all items-center">
                        {selectedTags.map((tag) => (
                          <span key={tag._id} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white pl-3 pr-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide">
                            {tag.name}
                            <button type="button" onClick={() => removeTag(tag._id)}
                              className="w-3.5 h-3.5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all">
                              <svg width="7" height="7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        <input type="text" value={tagInput}
                          onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                          onFocus={() => setShowTagSuggestions(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && tagInput.trim()) {
                              e.preventDefault();
                              const found = allTags.find((t) => t.name.toLowerCase() === tagInput.toLowerCase().trim());
                              if (found) addTag(found);
                              else addTag({ _id: tagInput.trim(), name: tagInput.trim() });
                            }
                          }}
                          placeholder={selectedTags.length === 0 ? "Nhập tag rồi nhấn Enter..." : ""}
                          className="flex-1 bg-transparent outline-none text-xs font-medium text-slate-700 placeholder:text-slate-300 min-w-[140px]" />
                      </div>
                      {showTagSuggestions && tagInput.trim() !== "" && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex flex-wrap gap-1.5"
                          onMouseDown={(e) => e.preventDefault()}>
                          {allTags.filter((t) => t.name.toLowerCase().includes(tagInput.toLowerCase())).slice(0, 8).map((tag) => (
                            <button key={tag._id} type="button" onClick={() => addTag(tag)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border border-slate-100 hover:border-emerald-200">
                              {tag.name}
                            </button>
                          ))}
                          {allTags.filter((t) => t.name.toLowerCase().includes(tagInput.toLowerCase())).length === 0 && (
                            <span className="text-[10px] text-slate-400 px-2 py-1">Nhấn Enter để tạo tag mới</span>
                          )}
                        </div>
                      )}
                    </div>
                    {suggestedTags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Gợi ý phổ biến</p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedTags.map((t) => (
                            <button key={t._id} type="button" onClick={() => addTag(t)}
                              disabled={!!selectedTags.find((s) => s._id === t._id)}
                              className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                              #{t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2.5">
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Gửi tài liệu ngay
                      </>
                    )}
                  </button>
                  <Link href="/documents"
                    className="px-6 py-4 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all">
                    Hủy
                  </Link>
                </div>
              </div>

              {/* ── SIDEBAR ── */}
              <div className="space-y-4 lg:sticky lg:top-6">

                {/* Progress tracker */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-5">Tiến trình</p>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[13px] top-5 bottom-5 w-px bg-slate-100" />
                    <div className="space-y-5">
                      {[
                        { n: "1", label: uploadType === "file" ? "Chọn tệp" : "Dán link", sub: uploadType === "file" ? (file ? file.name.slice(0, 22) + "…" : "Chưa chọn") : (link ? "Link đã dán" : "Chưa có link"), done: step1Done },
                        { n: "2", label: "Thông tin", sub: step2Done ? title.slice(0, 24) + (title.length > 24 ? "…" : "") : "Chưa điền", done: step2Done },
                        { n: "3", label: "Tags", sub: step3Done ? `${selectedTags.length} tag đã chọn` : "Tuỳ chọn", done: step3Done },
                      ].map(({ n, label, sub, done }) => (
                        <div key={n} className="flex items-start gap-3 relative">
                          <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-emerald-500 shadow-md shadow-emerald-200" : "bg-white border-2 border-slate-200"}`}>
                            {done ? (
                              <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-[9px] font-black text-slate-400">{n}</span>
                            )}
                          </div>
                          <div className="pt-0.5">
                            <p className={`text-xs font-black transition-colors ${done ? "text-slate-800" : "text-slate-400"}`}>{label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate max-w-[160px]">{sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hoàn thiện</span>
                      <span className="text-[10px] font-black text-emerald-600">
                        {[step1Done, step2Done, step3Done].filter(Boolean).length}/3
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${([step1Done, step2Done, step3Done].filter(Boolean).length / 3) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-slate-900 rounded-2xl p-5">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Quy định đóng góp</h4>
                  <div className="space-y-3.5">
                    {[
                      { icon: "✓", title: "Đúng ngành", desc: "Chọn đúng chuyên ngành và môn học." },
                      { icon: "✓", title: "Bản quyền", desc: "Không đăng tài liệu mật hoặc vi phạm." },
                      { icon: "✓", title: "Định dạng", desc: "Ưu tiên PDF, DOCX hoặc YouTube." },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <span className="text-emerald-400 text-[10px] font-black mt-0.5 shrink-0">{icon}</span>
                        <div>
                          <p className="text-[10px] font-black text-white">{title}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StepBadge({ n, done }) {
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-slate-100"}`}>
      {done ? (
        <svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-[11px] font-black text-slate-400 tabular-nums">0{n}</span>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

function ChevronDown() {
  return (
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
