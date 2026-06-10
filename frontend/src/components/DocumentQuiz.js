"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DocumentQuiz({ materialId, hasContent, isOpen, onClose }) {
  const [phase, setPhase] = useState("idle"); // "idle" | "loading" | "quiz" | "result" | "error"
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setQuestions([]);
      setSelected({});
      setErrorMsg("");
      return;
    }
    startQuiz();
  }, [isOpen]);

  if (!hasContent) return null;

  const startQuiz = async () => {
    setPhase("loading");
    setQuestions([]);
    setSelected({});
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/recommendations/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || "Lỗi không xác định");
        err.status = res.status;
        throw err;
      }
      setQuestions(data.questions);
      setPhase("quiz");
    } catch (err) {
      setErrorMsg(
        err.status === 429
          ? "Bạn tạo quiz quá nhanh, chờ chút nhé."
          : "AI đang bận, thử lại sau."
      );
      setPhase("error");
    }
  };

  const allAnswered = questions.length > 0 && Object.keys(selected).length === questions.length;
  const score = questions.filter((q, i) => selected[i] === q.answer).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Quiz Tự Động</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {phase === "quiz" ? `${Object.keys(selected).length}/${questions.length} đã trả lời` : "Trắc nghiệm AI"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <svg width="14" height="14" fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {/* Loading */}
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500">AI đang tạo câu hỏi...</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600 text-center">{errorMsg}</p>
              <button
                onClick={startQuiz}
                className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-bold transition-all active:scale-95"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Quiz */}
          {phase === "quiz" && (
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div key={qi} className="bg-slate-50 rounded-2xl p-5">
                  <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-xs font-black mr-2 shrink-0">{qi + 1}</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setSelected((prev) => ({ ...prev, [qi]: oi }))}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          selected[qi] === oi
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50"
                        }`}
                      >
                        <span className="font-black text-xs mr-2 text-slate-400">
                          {["A", "B", "C", "D"][oi]}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div className="space-y-6">
              {/* Score banner */}
              <div className={`rounded-2xl p-6 text-center ${score === questions.length ? "bg-emerald-50" : score >= questions.length / 2 ? "bg-violet-50" : "bg-orange-50"}`}>
                <p className={`text-4xl font-black mb-1 ${score === questions.length ? "text-emerald-600" : score >= questions.length / 2 ? "text-violet-600" : "text-orange-500"}`}>
                  {score}/{questions.length}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {score === questions.length ? "Xuất sắc! Bạn trả lời đúng tất cả." : score >= questions.length / 2 ? "Khá tốt! Tiếp tục cố gắng nhé." : "Cần ôn tập thêm nhé."}
                </p>
              </div>

              {/* Review */}
              {questions.map((q, qi) => {
                const userAnswer = selected[qi];
                const isCorrect = userAnswer === q.answer;
                const isUnanswered = userAnswer === undefined;
                return (
                  <div key={qi} className={`rounded-2xl p-5 border-2 ${isCorrect ? "border-emerald-200 bg-emerald-50/50" : isUnanswered ? "border-slate-200 bg-slate-50" : "border-red-200 bg-red-50/50"}`}>
                    <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black mr-2 shrink-0 ${isCorrect ? "bg-emerald-100 text-emerald-600" : isUnanswered ? "bg-slate-200 text-slate-500" : "bg-red-100 text-red-500"}`}>{qi + 1}</span>
                      {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const isThisCorrect = oi === q.answer;
                        const isThisSelected = oi === userAnswer;
                        return (
                          <div
                            key={oi}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 ${
                              isThisCorrect
                                ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                                : isThisSelected && !isThisCorrect
                                ? "border-red-300 bg-red-100 text-red-700"
                                : "border-transparent bg-white/60 text-slate-500"
                            }`}
                          >
                            <span className="font-black text-xs mr-2 opacity-60">
                              {["A", "B", "C", "D"][oi]}.
                            </span>
                            {opt}
                            {isThisCorrect && <span className="ml-2 text-xs font-black text-emerald-600">✓ Đúng</span>}
                            {isThisSelected && !isThisCorrect && <span className="ml-2 text-xs font-black text-red-500">✗ Sai</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {(phase === "quiz" || phase === "result") && (
          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex gap-3 justify-end">
            {phase === "quiz" && (
              <button
                onClick={() => setPhase("result")}
                disabled={!allAnswered}
                className="px-6 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Nộp bài
              </button>
            )}
            {phase === "result" && (
              <>
                <button
                  onClick={startQuiz}
                  className="px-5 py-2.5 rounded-xl border-2 border-violet-200 text-violet-600 text-sm font-bold hover:bg-violet-50 transition-all active:scale-95"
                >
                  Làm lại
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold transition-all active:scale-95"
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
