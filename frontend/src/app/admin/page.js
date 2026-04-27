"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    pending: 0,
    approved: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, materialRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/materials?status=all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const users = await userRes.json();
        const materials = await materialRes.json();

        const pending = materials.filter((m) => m.status === "pending");
        const approved = materials.filter((m) => m.status === "approved");

        setStats({
          users: users.length,
          materials: materials.length,
          pending: pending.length,
          approved: approved.length,
        });
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-[2rem]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
          Tổng quan <span className="text-primary">Hệ thống</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
          Dữ liệu thời gian thực
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Người dùng" value={stats.users} icon="👥" color="blue" />
        <StatCard title="Tài liệu" value={stats.materials} icon="📄" color="emerald" />
        <StatCard title="Chờ duyệt" value={stats.pending} icon="⏳" color="amber" />
        <StatCard title="Đã duyệt" value={stats.approved} icon="✅" color="primary" />
      </div>
      
      {/* Quick Actions or more stats could go here */}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    primary: "text-primary bg-primary/5 border-primary/10",
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 group hover:border-primary/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${colors[color] || colors.primary}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black text-slate-900 mt-1">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
