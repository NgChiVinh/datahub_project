"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã tải xong thông tin user mà không thấy user -> Chuyển về login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Trong khi đang kiểm tra hoặc chưa có user, hiển thị màn hình chờ (Loading)
  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Đang xác thực...</p>
      </div>
    );
  }

  // Nếu đã đăng nhập, cho phép xem nội dung bên trong
  return children;
}
