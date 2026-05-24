import React, { useState } from "react";
import { FileText, Sparkles, Copy, Check, Download } from "lucide-react";
import Markdown from "react-markdown";

interface SummarizerProps {
  materialContent: string;
  onSummarizeComplete: (summary: string) => void;
  savedSummary: string;
}

export const Summarizer: React.FC<SummarizerProps> = ({
  materialContent,
  onSummarizeComplete,
  savedSummary,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!materialContent || materialContent.trim().length === 0) {
      setError("Silakan ketik, tempel, atau unggah materi terlebih dahulu di panel sebelah kiri!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: materialContent }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errMessage = "Gagal menghasilkan ringkasan.";
        try {
          const errJson = JSON.parse(responseText);
          errMessage = errJson.error || errMessage;
        } catch {
          if (responseText.includes("GEMINI_API_KEY") || responseText.includes("apiKey") || responseText.includes("API key")) {
            errMessage = "GEMINI_API_KEY belum terkonfigurasi. Silakan tambahkan API key di panel Secrets.";
          } else if (responseText.includes("<!DOCTYPE html>") || responseText.toLowerCase().includes("<html")) {
            errMessage = "Koneksi server gagal (Server mengembalikan halaman HTML). Pastikan server aktif dan GEMINI_API_KEY di panel Secrets sudah benar.";
          } else {
            errMessage = `Server error (${response.status}): ${responseText.substring(0, 150)}`;
          }
        }
        throw new Error(errMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Respon server bukan format JSON yang valid (Kemungkinan server belum siap atau sedang restart).");
      }

      onSummarizeComplete(data.result);
    } catch (err: any) {
      setError(err.message || "Gagal mengubungi Express Server AI. Pastikan api key terkonfigurasi dengan benar.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!savedSummary) return;
    navigator.clipboard.writeText(savedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsFile = () => {
    if (!savedSummary) return;
    const element = document.createElement("a");
    const file = new Blob([savedSummary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "Rangkuman-AI-StudyAssistant.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">AI PDF & Text Summarizer</h3>
            <p className="text-xs text-slate-400">Ekstrak konsep inti, butir penting, & glosarium istilah sulit</p>
          </div>
        </div>

        {savedSummary && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-100 flex items-center gap-1 text-xs font-semibold"
              title="Copy markdown"
              id="btn-copy-summary"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Tersalin!" : "Salin"}
            </button>
            <button
              onClick={downloadAsFile}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-100 flex items-center gap-1 text-xs font-semibold"
              title="Unduh file"
              id="btn-download-summary"
            >
              <Download className="w-4 h-4" />
              Unduh
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {!savedSummary && !loading ? (
        <div className="py-12 flex flex-col items-center text-center max-w-md mx-auto space-y-4">
          <div className="p-4 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Materi Siap Dirangkum</h4>
            <p className="text-sm text-slate-400 mt-1">
              Tekan tombol di bawah untuk meminta AI mengekstraksi konsep terpenting & menyederhanakan pemahaman materi belajarmu.
            </p>
          </div>
          <button
            onClick={handleSummarize}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-[#7C3AED]/10 cursor-pointer flex items-center gap-2"
            id="btn-summarize-now"
          >
            <Sparkles className="w-4 h-4" />
            Mulai Rangkum Materi ✨
          </button>
        </div>
      ) : loading ? (
        <div className="py-16 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#7C3AED]/10 border-t-[#7C3AED] rounded-full animate-spin"></div>
            <Sparkles className="w-5 h-5 text-[#7C3AED] absolute top-3.5 left-3.5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 animate-pulse">Memindai Materi Akademis...</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              AI sedang menyortir data, mendefinisikan kuis-kuis, dan melukis glosarium istilah rumit untukmu.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mint green finish status badge indicated in section 3 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 text-[#10B981] text-xs font-semibold rounded-lg w-max select-none">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Selesai Rangkum (Berdasar AI Tutor)
          </div>

          <div className="prose prose-indigo max-w-none text-slate-700 border border-slate-100 bg-slate-50/40 p-5 rounded-2xl">
            <div className="markdown-body">
              <Markdown>{savedSummary}</Markdown>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSummarize}
              className="px-4 py-2 border border-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              id="btn-re-summarize"
            >
              🔄 Perbarui & Rangkum Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
