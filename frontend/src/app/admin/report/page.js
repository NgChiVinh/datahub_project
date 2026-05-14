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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      toast.error("Lỗi tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(status === "resolved" ? "Đã xử lý và ẩn tài liệu!" : "Đã bỏ qua báo cáo");
        fetchReports();
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Xóa báo cáo thành công!");
        fetchReports();
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  const filtered = reports.filter((report) => {
    if (activeStatus === "all") return true;
    return report.status === activeStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "dismissed":
        return "bg-slate-50 text-slate-500 border-slate-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "resolved":
        return "Đã xử lý (Ẩn bài)";
      case "dismissed":
        return "Bỏ qua";
      case "pending":
        return "Chưa xử lý";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Quản lý <span className="text-primary">Báo cáo</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Danh sách báo cáo vi phạm tài liệu ({reports.length})
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
          {[
            { label: "Tất cả", value: "all" },
            { label: "Chờ xử lý", value: "pending" },
            { label: "Đã xử lý", value: "resolved" },
            { label: "Bỏ qua", value: "dismissed" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveStatus(s.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeStatus === s.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Tài liệu bị báo cáo
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Người báo cáo
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Lý do
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Trạng thái
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl"></span>
                      <p className="text-sm font-bold text-slate-400">
                        Không có báo cáo nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {report.materialId?.title || "Tài liệu đã bị xóa"}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">
                          ID: {report.materialId?._id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {report.reporterId?.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {report.reporterId?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 italic">
                        "{report.reason}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${getStatusColor(report.status)}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all active:scale-95"
                              title="Chấp nhận báo cáo và ẩn tài liệu"
                            >
                              Giải quyết
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "dismissed")
                              }
                              className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                              title="Bỏ qua báo cáo này"
                            >
                              Bỏ qua
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="px-4 py-2 bg-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
