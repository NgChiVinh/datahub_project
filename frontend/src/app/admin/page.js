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

// Register ChartJS components
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

        const materialStatsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/materials/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const matStats = await materialStatsRes.json();
        setStats(matStats);
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. Dữ liệu biểu đồ Doughnut (Phân bổ ngành)
  const doughnutData = {
    labels: (stats?.majorDistribution || []).map(m => m.name),
    datasets: [
      {
        label: "Số lượng tài liệu",
        data: (stats?.majorDistribution || []).map(m => m.count),
        backgroundColor: [
          "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b",
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  // 2. Dữ liệu biểu đồ Bar (Xu hướng tháng)
  const barData = {
    labels: (stats?.monthlyUploads || []).map(m => `T${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: "Tài liệu mới",
        data: (stats?.monthlyUploads || []).map(m => m.count),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const commonOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 10, weight: '900', family: 'inherit' }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 12,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: '70%',
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { font: { size: 10, weight: '700' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: '700' } }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-[2.5rem]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-slate-200 rounded-[2.5rem]"></div>
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Tổng quan <span className="text-primary">Hệ thống</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Bảng điều khiển quản trị thời gian thực
          </p>
        </div>
        <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hệ thống ổn định</span>
        </div>
      </div>

      {/* THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Người dùng"
          value={stats?.summary?.totalUsers || 0}
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} 
          color="blue" 
        />
        <StatCard 
          title="Tổng tài liệu" 
          value={stats?.summary?.totalMaterials || 0} 
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} 
          color="emerald" 
        />
        <StatCard 
          title="Chờ phê duyệt" 
          value={stats?.summary?.pendingMaterials || 0} 
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} 
          color="amber" 
          important={stats?.summary?.pendingMaterials > 0}
        />
        <StatCard 
          title="Tổng lượt xem" 
          value={stats?.summary?.totalViews || 0} 
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>} 
          color="violet" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BIỂU ĐỒ TRÒN */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Phân bổ theo ngành</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tài liệu hệ thống</p>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* BIỂU ĐỒ CỘT - XU HƯỚNG THÁNG */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Xu hướng đóng góp</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Số lượng tài liệu 6 tháng gần nhất</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-500">{stats?.summary?.approvedMaterials || 0}</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Đã duyệt</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* FOOTER DASHBOARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/30"></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-black italic tracking-tighter">Chào mừng trở lại, Admin!</h3>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Hệ thống đang hoạt động ổn định. Có <span className="text-amber-400 font-bold">{stats?.summary?.pendingMaterials || 0} tài liệu mới</span> đang chờ bạn phê duyệt.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 mt-8 md:mt-0">
          <button onClick={() => router.push('/admin/material')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary/20">
            Kiểm duyệt ngay
          </button>
          <button onClick={() => router.push('/admin/user')} className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
            Quản lý User
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, important }) {
  const colors = {
    blue: "text-blue-500 bg-blue-50 border-blue-100/50",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100/50",
    amber: "text-amber-500 bg-amber-50 border-amber-100/50",
    violet: "text-violet-500 bg-violet-50 border-violet-100/50",
    primary: "text-primary bg-primary/5 border-primary/10",
  };

  return (
    <div className={`bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border group hover:border-primary/20 transition-all duration-500 ${important ? 'border-amber-200 ring-4 ring-amber-500/5' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm border ${colors[color] || colors.primary} transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        <div className={`w-2 h-2 rounded-full transition-colors ${important ? 'bg-amber-500 animate-ping' : 'bg-slate-200 group-hover:bg-primary'}`}></div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
