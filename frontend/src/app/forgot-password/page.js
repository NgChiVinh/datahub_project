"use client";

import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email },
      );

      setSuccess(true);
      setMessage(res.data.message);
    } catch (err) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Quên mật khẩu</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi email"}
        </button>
      </form>

      {message && <p style={{ color: success ? "green" : "red" }}>{message}</p>}
    </div>
  );
}
