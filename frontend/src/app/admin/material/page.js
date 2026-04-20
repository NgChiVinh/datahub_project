"use client";

import { useState, useEffect } from "react";

export default function MaterialAdmin() {
  const [pendingAssets, setPendingAssets] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/materials?status=all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      setAllMaterials(data);
      setPendingAssets(data.filter((i) => i.status === "pending"));
    } catch (err) {
      alert("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/materials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchMaterials();
  };

  const filtered = pendingAssets.filter((asset) => {
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Tài liệu") return asset.materialType !== "video";
    if (activeTab === "Video") return asset.materialType === "video";
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Duyệt tài liệu</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["Tất cả", "Tài liệu", "Video"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-emerald-500 text-white" : "bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Tiêu đề</th>
            <th>Người đăng</th>
            <th>Loại</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="4" className="p-6 text-center">
                Loading...
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="p-4">{item.title}</td>
                <td>{item.uploaderId?.fullName}</td>
                <td>{item.materialType}</td>
                <td className="flex gap-2 p-4">
                  <button
                    onClick={() => handleUpdateStatus(item._id, "approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item._id, "rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Từ chối
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
