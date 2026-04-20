"use client";

import { useEffect, useState } from "react";

export default function CategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 📥 fetch categories
  const fetchCategories = async () => {
    const res = await fetch("http://localhost:5000/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ create / update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/categories/${editingId}`
      : `http://localhost:5000/api/categories`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setForm({ name: "", description: "", parentId: "" });
    setEditingId(null);
    fetchCategories();
  };

  // ✏️ edit
  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId?._id || "",
    });
    setEditingId(cat._id);
  };

  // ❌ delete
  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;

    await fetch(`http://localhost:5000/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCategories();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý danh mục</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tên danh mục"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded"
          />

          {/* parent select */}
          <select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">-- Không có cha --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded">
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Tên</th>
            <th>Mô tả</th>
            <th>Danh mục cha</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-t">
              <td className="p-4">{cat.name}</td>
              <td>{cat.description}</td>
              <td>{cat.parentId?.name || "—"}</td>

              <td className="flex gap-2 p-4">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Sửa
                </button>

                <button
                  onClick={() => handleDelete(cat._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
