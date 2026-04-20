"use client";

import { useEffect, useState } from "react";

export default function ReviewAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 📥 fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReviews(data);
    } catch (err) {
      alert("Lỗi tải review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ❌ delete
  const handleDelete = async (id) => {
    if (!confirm("Xóa review này?")) return;

    await fetch(`http://localhost:5000/api/reviews/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchReviews();
  };

  // ⭐ render sao
  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý đánh giá</h2>

      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Nội dung</th>
            <th>Rating</th>
            <th>Người đánh giá</th>
            <th>Tài liệu</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="p-6 text-center">
                Loading...
              </td>
            </tr>
          ) : (
            reviews.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-4 max-w-[250px] truncate">
                  {r.content || "(Không có nội dung)"}
                </td>

                <td>{renderStars(r.rating)}</td>

                <td>{r.userId?.fullName}</td>

                <td className="max-w-[200px] truncate">
                  {r.materialId?.title}
                </td>

                <td>{new Date(r.createdAt).toLocaleString()}</td>

                <td className="p-4">
                  <button
                    onClick={() => handleDelete(r._id)}
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
