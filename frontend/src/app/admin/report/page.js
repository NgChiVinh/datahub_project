"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminTableWrapper from "@/components/admin/AdminTableWrapper";

const STATUS_CONFIG = {
  resolved:  { label: "Đã xử lý",  cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  dismissed: { label: "Bỏ qua",    cls: "bg-slate-100 text-slate-500 border-slate-200" },
  pending:   { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 border-amber-100" },
};

export default function ReportAdmin() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (activeStatus !== "all") params.set("status", activeStatus);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { toast.error("Lỗi tải danh sách báo cáo"); return; }
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch { toast.error("Lỗi tải danh sách báo cáo"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);
  useEffect(() => { fetchReports(); }, [activeStatus]);

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) {
        toast.success(status === "resolved" ? "Đã xử lý và ẩn tài liệu!" : "Đã bỏ qua báo cáo");
        fetchReports();
      } else { toast.error("Cập nhật thất bại"); }
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) { toast.success("Xóa báo cáo thành công!"); fetchReports(); }
      else { toast.error("Xóa thất bại"); }
    } catch { toast.error("Lỗi kết nối"); }
  };

  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "pending" },
    { label: "Đã xử lý", value: "resolved" },
    { label: "Bỏ qua", value: "dismissed" },
  ];

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <span className="w-6 h-[2px] bg-emerald-600"></span>
            Quản lý
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo vi phạm</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">{reports.length} báo cáo</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl overflow-x-auto max-w-full">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveStatus(t.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeStatus === t.value ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AdminTableWrapper>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài liệu bị báo cáo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người báo cáo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lý do</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">✅</span>
                      <p className="text-sm font-bold text-slate-400">Không có báo cáo nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={report._id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-700">
                            {report.materialId?.title || "Tài liệu đã bị xóa"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            ID: {report.materialId?._id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-700">{report.reporterId?.fullName}</span>
                          <span className="text-[11px] text-slate-400">{report.reporterId?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 italic max-w-[200px] line-clamp-2">
                          &quot;{report.reason}&quot;
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "resolved")}
                                className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all active:scale-95"
                                title="Chấp nhận và ẩn tài liệu"
                              >
                                Giải quyết
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "dismissed")}
                                className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                                title="Bỏ qua báo cáo"
                              >
                                Bỏ qua
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </AdminTableWrapper>
    </div>
  );
}
