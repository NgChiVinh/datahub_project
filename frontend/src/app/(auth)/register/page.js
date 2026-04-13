"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    majorId: "",
  });
  const [majors, setMajors] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const firstInputRef = useRef(null);

  // Lấy danh sách chuyên ngành
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/majors");
        const data = await res.json();
        if (Array.isArray(data)) {
          setMajors(data);
          if (data.length > 0) setFormData(prev => ({ ...prev, majorId: data[0]._id }));
        }
      } catch (error) {
        console.error("Lỗi lấy chuyên ngành:", error);
      }
    };
    fetchMajors();
  }, []);

  // Tự động tách MSSV từ email khi email thay đổi
  useEffect(() => {
    if (formData.email.includes("@vanlanguni.vn")) {
      const emailParts = formData.email.split("@")[0].split(".");
      const possibleId = emailParts[emailParts.length - 1];
      if (!isNaN(possibleId) && possibleId.length >= 7) {
        setFormData(prev => ({ ...prev, studentId: possibleId }));
      }
    }
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // ... (giữ nguyên các bước validate password)

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          majorId: formData.majorId
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng ký thành công! Chào mừng bạn gia nhập cộng đồng IT VLU.");
        // Tự động đăng nhập với token nhận được từ Backend
        login(data.user, data.token);
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#fafbfc] relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#004d40 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="w-full max-w-[480px] z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Tham gia <span className="text-primary">Cộng đồng</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Dành riêng cho sinh viên IT Văn Lang</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold rounded-xl flex items-center gap-3 animate-shake">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email sinh viên Văn Lang</label>
                <input 
                  type="email" 
                  required
                  placeholder="ho_ten.mssv@vanlanguni.vn"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm placeholder:text-slate-300"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã sinh viên</label>
                  <input 
                    type="text" 
                    required
                    placeholder="227480..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chuyên ngành</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm appearance-none cursor-pointer"
                  value={formData.majorId}
                  onChange={(e) => setFormData({...formData, majorId: e.target.value})}
                >
                  {majors.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm placeholder:text-slate-300"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm placeholder:text-slate-300"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                 </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <span>Tạo tài khoản sinh viên</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="py-6 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline font-black transition-all">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
