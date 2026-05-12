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
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, materialStatsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/materials/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const users = await userRes.json();
        const matStats = await materialStatsRes.json();

        setUserCount(Array.isArray(users) ? users.length : 0);
        setStats(matStats);
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: (stats?.majorDistribution || []).map(m => m.name),
    datasets: [
      {
        label: "Số lượng tài liệu",
        data: (stats?.majorDistribution || []).map(m => m.count),
        backgroundColor: [
          "#3b82f6", // blue-500
          "#10b981", // emerald-500
          "#f59e0b", // amber-500
          "#ef4444", // red-500
          "#8b5cf6", // violet-500
          "#ec4899", // pink-500
          "#64748b", // slate-500
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
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
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
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
        <div className="h-96 bg-slate-200 rounded-[2.5rem]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
          Tổng quan <span className="text-primary">Hệ thống</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
          Bảng điều khiển quản trị thời gian thực
        </p>
      </div>

      {/* THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Người dùng" 
          value={userCount} 
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
        />
        <StatCard 
          title="Tổng lượt tải" 
          value={stats?.summary?.totalDownloads || 0} 
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>} 
          color="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BIỂU ĐỒ TRÒN */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col items-center">
          <div className="w-full mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Phân bổ theo ngành</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tỷ lệ tài liệu hệ thống</p>
          </div>
          <div className="w-full h-[300px] relative">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* CÁC THÔNG TIN KHÁC HOẶC PHẦN CHÀO MỪNG */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/30"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black italic tracking-tighter mb-4">Chào mừng trở lại, Admin!</h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Hệ thống đang hoạt động ổn định. Có <span className="text-amber-400 font-bold">{stats?.summary?.pendingMaterials || 0} tài liệu mới</span> đang chờ bạn phê duyệt. Hãy kiểm tra để đảm bảo chất lượng nội dung cho cộng đồng sinh viên.
            </p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => window.location.href='/admin/material'} className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary/20">
                Kiểm duyệt ngay
              </button>
              <button onClick={() => window.location.href='/admin/user'} className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                Quản lý User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "text-blue-500 bg-blue-50 border-blue-100/50",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100/50",
    amber: "text-amber-500 bg-amber-50 border-amber-100/50",
    primary: "text-primary bg-primary/5 border-primary/10",
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 group hover:border-primary/20 transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm border ${colors[color] || colors.primary} transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-primary transition-colors"></div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
