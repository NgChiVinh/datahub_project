"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
    } catch {
      toast.error("Lỗi tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
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
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
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
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const statusConfig = {
    resolved:  { label: "Đã xử lý", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    dismissed: { label: "Bỏ qua",   cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
    pending:   { label: "Chờ xử lý", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  };

  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "pending" },
    { label: "Đã xử lý", value: "resolved" },
    { label: "Bỏ qua", value: "dismissed" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Báo cáo vi phạm</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">{reports.length} báo cáo</p>
        </div>

        <div className="flex gap-1 p-1 bg-[#ffffff06] border border-[#ffffff08] rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveStatus(t.value)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeStatus === t.value
                  ? "bg-[#ffffff10] text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tài liệu bị báo cáo</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Người báo cáo</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lý do</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff06]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-[13px] text-slate-500">Không có báo cáo nào</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const sc = statusConfig[report.status] || statusConfig.pending;
                  return (
                    <tr key={report._id} className="hover:bg-[#ffffff04] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-medium text-slate-200">
                            {report.materialId?.title || "Tài liệu đã bị xóa"}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {report.materialId?._id}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] text-slate-300">{report.reporterId?.fullName}</span>
                          <span className="text-[11px] text-slate-600">{report.reporterId?.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-slate-400 italic max-w-[200px] line-clamp-2">
                          &quot;{report.reason}&quot;
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-medium rounded-lg border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "resolved")}
                                className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-[11px] font-medium rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                                title="Chấp nhận và ẩn tài liệu"
                              >
                                Giải quyết
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "dismissed")}
                                className="px-3 py-1.5 bg-[#ffffff08] text-slate-400 text-[11px] font-medium rounded-lg border border-[#ffffff10] hover:bg-[#ffffff12] hover:text-slate-200 transition-all"
                                title="Bỏ qua báo cáo"
                              >
                                Bỏ qua
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
