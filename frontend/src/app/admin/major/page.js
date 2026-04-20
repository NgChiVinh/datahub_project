"use client";

import { useEffect, useState } from "react";

export default function MajorAdmin() {
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({
    majorCode: "",
    name: "",
    department: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 📥 fetch majors
  const fetchMajors = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/majors");
      const data = await res.json();
      setMajors(data);
    } catch (err) {
      alert("Lỗi tải danh sách ngành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  // ➕ create / update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/majors/${editingId}`
      : `http://localhost:5000/api/majors`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(editingId && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(form),
    });

    setForm({ majorCode: "", name: "", department: "" });
    setEditingId(null);
    fetchMajors();
  };

  // ✏️ edit
  const handleEdit = (m) => {
    setForm({
      majorCode: m.majorCode,
      name: m.name,
      department: m.department,
    });
    setEditingId(m._id);
  };

  // ❌ delete
  const handleDelete = async (id) => {
    if (!confirm("Xóa ngành này?")) return;

    await fetch(`http://localhost:5000/api/majors/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchMajors();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý ngành học</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Mã ngành"
            value={form.majorCode}
            onChange={(e) => setForm({ ...form, majorCode: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Tên ngành"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Khoa"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>

        <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded">
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Mã ngành</th>
            <th>Tên ngành</th>
            <th>Khoa</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="p-6 text-center">
                Loading...
              </td>
            </tr>
          ) : (
            majors.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="p-4">{m.majorCode}</td>
                <td>{m.name}</td>
                <td>{m.department}</td>

                <td className="flex gap-2 p-4">
                  <button
                    onClick={() => handleEdit(m)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(m._id)}
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
