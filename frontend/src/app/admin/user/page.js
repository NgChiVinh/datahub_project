"use client";

import { useEffect, useState } from "react";

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      alert("Lỗi tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔁 đổi role
  const handleChangeRole = async (id, role) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/users/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    fetchUsers();
  };

  // ❌ xóa user
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá user này?")) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchUsers();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý người dùng</h2>

      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Tên</th>
            <th>Email</th>
            <th>MSSV</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="p-6 text-center">
                Loading...
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-4">{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.studentId}</td>

                {/* ROLE */}
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>

                {/* ACTION */}
                <td className="flex gap-2 p-4">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
