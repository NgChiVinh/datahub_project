"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const doughnutData = {
    labels: (stats?.majorDistribution || []).map((m) => m.name),
    datasets: [
      {
        data: (stats?.majorDistribution || []).map((m) => m.count),
        backgroundColor: [
          "#22d3ee", "#818cf8", "#34d399", "#fb923c", "#f472b6", "#a78bfa", "#4ade80",
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: (stats?.monthlyUploads || []).map((m) => `T${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: "Tài liệu mới",
        data: (stats?.monthlyUploads || []).map((m) => m.count),
        backgroundColor: "rgba(34, 211, 238, 0.15)",
        borderColor: "#22d3ee",
        borderWidth: 1.5,
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  const darkTooltip = {
    backgroundColor: "#1c1c28",
    titleColor: "#f8fafc",
    bodyColor: "#94a3b8",
    borderColor: "#ffffff10",
    borderWidth: 1,
    padding: 10,
    cornerRadius: 10,
  };

  const doughnutOptions = {
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 16,
          color: "#64748b",
          font: { size: 11, weight: "500" },
        },
      },
      tooltip: darkTooltip,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
      tooltip: darkTooltip,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#ffffff06" },
        border: { display: false },
        ticks: { color: "#475569", font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#475569", font: { size: 11 } },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-[#ffffff08] rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#ffffff06] rounded-2xl border border-[#ffffff08]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-[#ffffff06] rounded-2xl border border-[#ffffff08]"></div>
          <div className="lg:col-span-2 h-80 bg-[#ffffff06] rounded-2xl border border-[#ffffff08]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Tổng quan hệ thống</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Dữ liệu thời gian thực</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#ffffff06] border border-[#ffffff08] rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Hệ thống ổn định</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Người dùng"
          value={stats?.summary?.totalUsers || 0}
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
          accent="cyan"
        />
        <StatCard
          title="Tổng tài liệu"
          value={stats?.summary?.totalMaterials || 0}
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          accent="emerald"
        />
        <StatCard
          title="Chờ phê duyệt"
          value={stats?.summary?.pendingMaterials || 0}
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          accent="amber"
          alert={stats?.summary?.pendingMaterials > 0}
        />
        <StatCard
          title="Tổng lượt xem"
          value={stats?.summary?.totalViews || 0}
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
          accent="violet"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] p-6 flex flex-col">
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-white">Phân bổ theo ngành</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Tài liệu hệ thống</p>
          </div>
          <div className="flex-1 min-h-[260px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111118] rounded-2xl border border-[#ffffff0a] p-6 flex flex-col">
          <div className="mb-5 flex justify-between items-start">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Xu hướng đóng góp</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">6 tháng gần nhất</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-400">{stats?.summary?.approvedMaterials || 0}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Đã duyệt</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-[#111118] border border-[#ffffff0a] rounded-2xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-base font-semibold text-white">Chào mừng trở lại, Admin</h3>
          <p className="text-[13px] text-slate-400 mt-1.5 max-w-sm leading-relaxed">
            Hệ thống đang ổn định. Có{" "}
            <span className="text-amber-400 font-semibold">{stats?.summary?.pendingMaterials || 0} tài liệu</span>{" "}
            đang chờ phê duyệt.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 flex-shrink-0">
          <button
            onClick={() => router.push("/admin/material")}
            className="px-5 py-2.5 bg-cyan-500 text-[#09090f] rounded-xl font-semibold text-[13px] hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            Kiểm duyệt ngay
          </button>
          <button
            onClick={() => router.push("/admin/user")}
            className="px-5 py-2.5 bg-[#ffffff08] border border-[#ffffff10] text-slate-300 rounded-xl font-medium text-[13px] hover:bg-[#ffffff12] transition-all active:scale-95"
          >
            Quản lý User
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent, alert }) {
  const accentMap = {
    cyan:    { icon: "text-cyan-400 bg-cyan-500/10",    dot: "bg-cyan-400" },
    emerald: { icon: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-400" },
    amber:   { icon: "text-amber-400 bg-amber-500/10",  dot: "bg-amber-400" },
    violet:  { icon: "text-violet-400 bg-violet-500/10", dot: "bg-violet-400" },
  };
  const c = accentMap[accent] || accentMap.cyan;

  return (
    <div className={`bg-[#111118] rounded-2xl border p-5 group transition-all duration-200 ${alert ? "border-amber-500/20" : "border-[#ffffff0a] hover:border-[#ffffff18]"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${alert ? "bg-amber-400 animate-ping" : c.dot + " opacity-40"}`}></div>
      </div>
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}
