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

        // fetch song song cho nhanh
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
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card title="Người dùng" value={stats.users} />
        <Card title="Tài liệu" value={stats.materials} />
        <Card title="Chờ duyệt" value={stats.pending} />
        <Card title="Đã duyệt" value={stats.approved} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
