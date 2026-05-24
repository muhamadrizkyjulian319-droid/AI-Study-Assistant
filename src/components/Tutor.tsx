import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RefreshCw, AlertTriangle, Smile } from "lucide-react";
import { ChatMessage } from "../types";

interface TutorProps {
  materialContent: string;
  chatHistory: ChatMessage[];
  onAddChatMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
}

export const Tutor: React.FC<TutorProps> = ({
  materialContent,
  chatHistory,
  onAddChatMessage,
  onClearChat,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend || textToSend.trim().length === 0) return;

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", text: textToSend };
    onAddChatMessage(userMsg);
    setQuery("");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: materialContent,
          query: textToSend,
          chatHistory: chatHistory,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Gagal berkomunikasi dengan AI Tutor.");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = { role: "model", text: data.result };
      onAddChatMessage(aiMsg);
    } catch (err: any) {
      setError(err.message || "Aduh, gagal kirim chat ke Kakak Tutor nih brosis. Coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED_QUERIES = [
    {
      title: "Analogi Pacaran / Gaul",
      text: "Jelaskan konsep materi aktif ini pakai perumpamaan dunia percintaan remaja SMA atau sosmed dong!",
    },
    {
      title: "Bimbing Kerjain Soal (No Contek)",
      text: "Kak, tolong ngerjain tugas rumahku dong: jelaskan persamaan materi ini secara instan!",
    },
    {
      title: "ELI5 Konsep Tersulit",
      text: "Jelaskan bagian paling susah dipahami dari bab ini pakai kalimat paling gampang seakan aku anak umur 5 tahun!",
    },
    {
      title: "Melenceng (Gosip Artis)",
      text: "Kak tahu gosip artis yang lagi viral di TikTok kemarin gak?",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#F97316]/10 text-[#F97316] rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">AI Tutor: Kakak Kelas Kece Mode ELI5</h3>
            <p className="text-xs text-slate-400">Belajar asyik tanpa tegang, analogi santai ala tongkrongan</p>
          </div>
        </div>
        
        {chatHistory.length > 0 && (
          <button
            onClick={onClearChat}
            className="text-xs font-semibold text-slate-400 hover:text-[#F97316] transition-colors border border-slate-200 px-2.5 py-1 rounded-lg"
          >
            Bersihkan Chat
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 -mx-4 animate-fade-in">
        {chatHistory.length === 0 && (
          <div className="py-8 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 bg-orange-50 text-[#F97316] rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Smile className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Halo loopers! 👋</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tanya konsep apa aja tentang materi aktifmu! Kakak AI Tutor siap bantu jelasin pake analogi paling asyik, gaul, plus no-judgement!
              </p>
            </div>
            {materialContent ? (
              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-[11px] text-[#F97316] italic">
                💡 Materi pendukung aktif terdeteksi. AI Tutor akan fokus mendalami bab pilihanmu brosis!
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-700 italic">
                ⚠️ Kamu belum memilih/menulis materi di kiri. Kamu masih bisa bertanya tentang konsep umum sekolah, sob!
              </div>
            )}
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#F97316] text-white rounded-br-none shadow-xs"
                  : "bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none prose prose-slate"
              }`}
            >
              {msg.role === "user" ? (
                msg.text
              ) : (
                <div className="space-y-1.5 text-xs md:text-sm">
                  {/* Highlight scaffolding block differently if it looks like a lesson */}
                  {msg.text.includes("scaffolding") || msg.text.includes("bimbing") || msg.text.includes("rumus") || msg.text.includes("kemampuan") ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-full w-max font-bold mb-2 uppercase">
                      💡 Tutorial Bertahap Aktif (Tanpa Mencontek!)
                    </div>
                  ) : null}
                  <div>{msg.text}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl p-4 text-sm flex items-center gap-2 rounded-bl-none">
              <RefreshCw className="w-4 h-4 animate-spin text-[#F97316]" />
              <span>Kak AI Tutor lagi meraba-raba materi...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Inputs */}
      {chatHistory.length === 0 && (
        <div className="py-2.5 border-t border-slate-100 shrink-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 select-none font-mono">
            Rekomendasi Pertanyaan Gaul:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="p-2.5 text-left border border-slate-100 hover:border-orange-200 hover:bg-orange-50/20 text-[11px] text-slate-600 hover:text-orange-700 rounded-xl transition-all cursor-pointer truncate font-medium shadow-xs bg-white"
                title={q.text}
              >
                🔥 {q.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="pt-3 border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(query);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tanyakan bagian tersulit, atau minta analogi pacaran..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/25 focus:border-[#F97316] text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="p-3 bg-[#F97316] hover:bg-orange-600 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            id="btn-send-tutor"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
