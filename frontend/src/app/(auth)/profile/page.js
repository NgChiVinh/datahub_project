"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("uploads");
  const [userDocs, setUserDocs] = useState([]);
  const [favDocs, setFavDocs] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || "");
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id, activeTab]);

  const fetchData = async () => {
    if (!user?._id) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (activeTab === "uploads") {
        const res = await fetch(
          `${API_URL}/api/materials?uploaderId=${user._id}&status=all`,
          { headers }
        );

        if (!res.ok) throw new Error("Không thể tải tài liệu của tôi");

        const data = await res.json();
        setUserDocs(data.materials || []);
      } else if (activeTab === "favorites") {
        const res = await fetch(
          `${API_URL}/api/materials?likedBy=${user._id}`,
          { headers }
        );

        if (!res.ok) throw new Error("Không thể tải tài liệu đã thích");

        const data = await res.json();
        setFavDocs(data.materials || []);
      } else if (activeTab === "collections") {
        const res = await fetch(`${API_URL}/api/collections?userId=${user._id}`, { headers });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Không thể tải bộ sưu tập");
        }

        const data = await res.json();
        setCollections(data || []);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Lỗi fetch dữ liệu:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("fullName", editName);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Cập nhật hồ sơ thành công!");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSelectedFile(null);
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/materials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Xóa tài liệu thành công");
        setUserDocs((prev) => prev.filter((d) => d._id !== id));
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi server");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bộ sưu tập này?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/collections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Xóa bộ sưu tập thành công");
        setCollections((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi server");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const totalViews = userDocs.reduce(
    (sum, doc) => sum + (doc.metrics?.viewCount || 0),
    0
  );

  const totalDownloads = userDocs.reduce(
    (sum, doc) => sum + (doc.metrics?.downloadCount || 0),
    0
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
        <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-10">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden mb-12 relative">
            <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <div className="px-10 md:px-16 pb-12 relative">
              <div className="flex flex-col md:flex-row items-end gap-8 -mt-20 mb-8">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-2xl overflow-hidden">
                    <div className="w-full h-full rounded-[2.5rem] bg-slate-100 flex items-center justify-center relative">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt="avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-emerald-500">
                          {user.fullName?.[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="absolute bottom-2 right-2 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    </svg>
                  </label>
                </div>

                <div className="flex-1 space-y-2 pb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                      {user.fullName}
                    </h1>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                <StatItem label="Đóng góp" value={userDocs.length} color="text-emerald-500" />
                <StatItem label="Lượt xem" value={totalViews} color="text-blue-500" />
                <StatItem label="Lượt tải" value={totalDownloads} color="text-amber-500" />
                <StatItem label="MSSV" value={user.studentId || "N/A"} color="text-purple-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: "uploads", label: "Tài liệu của tôi" },
                { id: "favorites", label: "Tài liệu đã thích" },
                { id: "collections", label: "Bộ sưu tập" },
                { id: "settings", label: "Cài đặt" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                    activeTab === tab.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl"
                      : "bg-white border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "collections" && (
              <button
                onClick={() => setIsCollectionModalOpen(true)}
                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Tạo bộ sưu tập
              </button>
            )}
          </div>

          <div className="min-h-[400px]">
            {isLoading && activeTab !== "settings" ? (
              <div className="flex justify-center py-20 animate-pulse">
                <div className="text-slate-300 font-black uppercase tracking-[0.3em]">
                  Đang tải...
                </div>
              </div>
            ) : (
              <>
                {activeTab === "uploads" && (
                  <DocumentList docs={userDocs} onDelete={handleDeleteDoc} isOwner={true} />
                )}

                {activeTab === "favorites" && (
                  <DocumentList docs={favDocs} isOwner={false} />
                )}

                {activeTab === "collections" && (
                  <CollectionList items={collections} onDelete={handleDeleteCollection} user={user} />
                )}

                {activeTab === "settings" && (
                  <SettingsForm
                    fullName={editName}
                    setFullName={setEditName}
                    onSubmit={handleUpdateProfile}
                    isUpdating={isUpdating}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    setIsPasswordModalOpen={setIsPasswordModalOpen}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />

        <CreateCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onSuccess={(newCol) => setCollections((prev) => [newCol, ...prev])}
        />
      </div>
    </ProtectedRoute>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-xl font-black ${color} tracking-tight`}>
        {value}
      </p>
    </div>
  );
}

function DocumentList({ docs = [], onDelete, isOwner }) {
  if (docs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">
          Không có dữ liệu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {docs.map((doc) => (
        <div
          key={doc._id}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
        >
          <div className="flex items-center gap-6 flex-1">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                doc.materialType === "video"
                  ? "bg-slate-900 text-white"
                  : "bg-emerald-50 text-emerald-500"
              }`}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-800 uppercase italic line-clamp-1">
                  {doc.title}
                </h3>

                {isOwner && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${
                      doc.status === "approved"
                        ? "bg-emerald-100 text-emerald-600"
                        : doc.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {doc.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                <span>{doc.materialType}</span>
                <span>{doc.metrics?.viewCount || 0} Lượt xem</span>
                <span>
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/documents/${doc._id}`}
              className="px-6 py-3 bg-slate-50 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Chi tiết
            </Link>

            {isOwner && (
              <button
                onClick={() => onDelete(doc._id)}
                className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionList({ items = [], onDelete, user }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">
          Chưa có bộ sưu tập nào
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((col) => {
        const isOwner = col.userId?._id === user._id || col.userId === user._id;

        return (
          <div
            key={col._id}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
          >
            {isOwner && (
              <button
                onClick={() => onDelete(col._id)}
                className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                Xóa
              </button>
            )}

            <h3 className="text-lg font-black text-slate-800 uppercase italic mb-2 line-clamp-1">
              {col.name}
            </h3>

            <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6">
              {col.description || "Không có mô tả"}
            </p>

            <div className="flex items-center justify-between mb-8">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {col.materialIds?.length || 0} Tài liệu
              </span>

              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  col.isPublic
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {col.isPublic ? "Công khai" : "Riêng tư"}
              </span>
            </div>

            <Link
              href={`/collections/${col._id}`}
              className="w-full flex items-center justify-center py-4 bg-slate-50 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
            >
              Xem chi tiết
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function SettingsForm({
  fullName,
  setFullName,
  onSubmit,
  isUpdating,
  selectedFile,
  setSelectedFile,
  setIsPasswordModalOpen,
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-xl">
      <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-10 tracking-tight">
        Cài đặt <span className="text-emerald-500">Tài khoản</span>
      </h3>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Họ và tên
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-500/30 transition-all text-slate-700 font-bold text-sm"
          />
        </div>

        {selectedFile && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">
              IMG
            </div>

            <p className="text-[10px] font-black text-emerald-600 uppercase truncate flex-1">
              {selectedFile.name}
            </p>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-red-500"
            >
              X
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
        >
          {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
        </button>
      </form>

      <div className="mt-12 pt-10 border-t border-slate-50 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6">
          Bảo mật
        </p>

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-8"
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
}