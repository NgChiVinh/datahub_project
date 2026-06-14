"use client";

import { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const COLORS = ["#059669","#3b82f6","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#64748b"];

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;
    const { ctx, chartArea } = chart;
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    if (!total) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(total.toLocaleString(), cx, cy - 10);
    ctx.font = "600 10px Inter, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.letterSpacing = "2px";
    ctx.fillText("TÀI LIỆU", cx, cy + 14);
    ctx.restore();
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradient, setGradient] = useState(null);
  const lineChartRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(await res.json());
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const chart = lineChartRef.current;
    if (!chart) return;
    const ctx = chart.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, 280);
    grad.addColorStop(0, "rgba(5,150,105,0.22)");
    grad.addColorStop(0.6, "rgba(5,150,105,0.06)");
    grad.addColorStop(1, "rgba(5,150,105,0)");
    setGradient(grad);
  }, [loading]);

  const tooltipStyle = {
    backgroundColor: "#1e293b",
    titleColor: "#f8fafc",
    bodyColor: "#94a3b8",
    padding: 12,
    cornerRadius: 12,
    borderColor: "#334155",
    borderWidth: 1,
    displayColors: false,
  };

  const doughnutData = {
    labels: (stats?.majorDistribution || []).map(m => m.name),
    datasets: [{
      data: (stats?.majorDistribution || []).map(m => m.count),
      backgroundColor: COLORS,
      borderWidth: 0,
      hoverOffset: 12,
    }],
  };

  const doughnutOptions = {
    cutout: "74%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 11, weight: "600" }, color: "#64748b" },
      },
      tooltip: { ...tooltipStyle, displayColors: true },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const lineLabels = (stats?.monthlyUploads || []).map(m => `T${m._id.month}/${String(m._id.year).slice(2)}`);
  const lineValues = (stats?.monthlyUploads || []).map(m => m.count);

  const lineData = {
    labels: lineLabels,
    datasets: [{
      label: "Tài liệu mới",
      data: lineValues,
      fill: true,
      backgroundColor: gradient || "rgba(5,150,105,0.1)",
      borderColor: "#059669",
      borderWidth: 2.5,
      pointBackgroundColor: "#059669",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#059669",
      tension: 0.4,
    }],
  };

  const lineOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => ` ${item.raw} tài liệu`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 }, stepSize: 1 },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-52 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-slate-100 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-100 rounded-2xl"></div>
          <div className="lg:col-span-2 h-80 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <span className="w-6 h-[2px] bg-emerald-600"></span>
            Quản trị
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hệ thống ổn định</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Người dùng"    value={stats?.summary?.totalUsers || 0}        icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"  color="blue" />
        <StatCard title="Tổng tài liệu" value={stats?.summary?.totalMaterials || 0}   icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="emerald" />
        <StatCard title="Chờ phê duyệt" value={stats?.summary?.pendingMaterials || 0} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="amber" alert={stats?.summary?.pendingMaterials > 0} />
        <StatCard title="Lượt xem"      value={stats?.summary?.totalViews || 0}        icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut */}
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Phân bổ theo ngành</h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-6">Tài liệu hệ thống</p>
          <div className="flex-1 min-h-[260px]">
            <Doughnut data={doughnutData} options={doughnutOptions} plugins={[centerTextPlugin]} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Xu hướng đóng góp</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">6 tháng gần nhất</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-600">{(stats?.summary?.approvedMaterials || 0).toLocaleString()}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã duyệt</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px]">
            <Line ref={lineChartRef} data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2">Chào mừng trở lại, {user?.fullName || "Admin"}!</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Hệ thống đang hoạt động ổn định. Có{" "}
            <span className="text-amber-400 font-bold">{stats?.summary?.pendingMaterials || 0} tài liệu mới</span>{" "}
            đang chờ bạn phê duyệt.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 flex-shrink-0">
          <button onClick={() => router.push("/admin/material")}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-[13px] hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/30">
            Kiểm duyệt ngay
          </button>
          <button onClick={() => router.push("/admin/user")}
            className="px-6 py-3 bg-white/10 border border-white/10 text-white rounded-xl font-bold text-[13px] hover:bg-white/20 transition-all active:scale-95">
            Quản lý User
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, alert }) {
  const colorMap = {
    blue:    { icon: "text-blue-500 bg-blue-50 border-blue-100/50" },
    emerald: { icon: "text-emerald-500 bg-emerald-50 border-emerald-100/50" },
    amber:   { icon: "text-amber-500 bg-amber-50 border-amber-100/50" },
    violet:  { icon: "text-violet-500 bg-violet-50 border-violet-100/50" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border group hover:shadow-md hover:border-primary/20 transition-all duration-300 ${alert ? "border-amber-200 ring-4 ring-amber-500/5" : "border-slate-100"}`}>
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${c.icon} transition-transform group-hover:scale-110 duration-300`}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className={`w-2 h-2 rounded-full mt-1 ${alert ? "bg-amber-500 animate-ping" : "bg-slate-200 group-hover:bg-primary transition-colors"}`}></div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}
