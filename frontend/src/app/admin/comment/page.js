"use client";

import { useEffect, useState } from "react";

export default function CommentAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 📥 fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setComments(data);
    } catch (err) {
      alert("Lỗi tải comment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // ❌ delete comment
  const handleDelete = async (id) => {
    if (!confirm("Xóa comment này?")) return;

    await fetch(`http://localhost:5000/api/comments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchComments();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý bình luận</h2>

      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Nội dung</th>
            <th>Người đăng</th>
            <th>Tài liệu</th>
            <th>Thời gian</th>
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
            comments.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-4 max-w-[300px] truncate">{c.content}</td>

                <td>{c.userId?.fullName}</td>

                <td className="max-w-[200px] truncate">
                  {c.materialId?.title}
                </td>

                <td>{new Date(c.createdAt).toLocaleString()}</td>

                <td className="p-4">
                  <button
                    onClick={() => handleDelete(c._id)}
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
