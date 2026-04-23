"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function ResetPasswordPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/reset-password/${token}`,
        { password },
      );

      setSuccess(true);
      setMessage(res.data.message);
    } catch (err) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Token không hợp lệ");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Đặt lại mật khẩu</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>

      {message && <p style={{ color: success ? "green" : "red" }}>{message}</p>}
    </div>
  );
}
