"use client";
import { useState, useEffect, useRef } from "react";

export default function DocumentChat({ materialId, hasContent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!hasContent) return null;

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const history = messages.slice(-6);
    setMessages((prev) => [...prev, { role: "user", content: question }].slice(-40));
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/recommendations/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materialId, question, history }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || "Lỗi không xác định");
        err.status = res.status;
        throw err;
      }
      setMessages((prev) =>
        [...prev, { role: "assistant", content: data.answer }].slice(-40)
      );
    } catch (err) {
      const msg =
        err.status === 429
          ? "Bạn hỏi quá nhanh, chờ chút nhé."
          : "AI đang bận, vui lòng thử lại sau.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }].slice(-40));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">Hỏi AI về tài liệu này</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Trợ lý học tập thông minh
          </p>
        </div>
      </div>

      {/* Message list */}
      {(messages.length > 0 || isLoading) && (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="11" height="11" fill="none" stroke="#10b981" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" fill="none" stroke="#10b981" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2.5 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về nội dung tài liệu... (Enter để gửi)"
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none placeholder:text-slate-300 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          aria-label="Gửi câu hỏi"
          className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
