import React, { useState } from "react";
import { Compass, Sparkles, CheckSquare, Square, Share2, ClipboardList } from "lucide-react";
import Markdown from "react-markdown";

interface RoadmapProps {
  materialTitle: string;
  materialContent: string;
  savedRoadmap: string;
  onRoadmapComplete: (roadmap: string) => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({
  materialTitle,
  materialContent,
  savedRoadmap,
  onRoadmapComplete,
}) => {
  const [targetTopic, setTargetTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple state for checklist tasks generated from stages
  const [checklist, setChecklist] = useState<{ id: number; text: string; completed: boolean }[]>([
    { id: 1, text: "Ulas Definisi Dasar dan Konsep Inti materi", completed: false },
    { id: 2, text: "Jalankan teknik penjelasan mandiri (Feynman Technique)", completed: false },
    { id: 3, text: "Kerjakan 5 Kuis latihan tanpa melihat kunci", completed: false },
    { id: 4, text: "Ulas kembali materi yang ditandai Coral Orange (Sering Salah)", completed: false },
  ]);

  const handleGenerateRoadmap = async () => {
    const topic = targetTopic.trim() || materialTitle || "Materi Aktif";
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: materialContent,
          targetTopic: topic,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errMessage = "Gagal membangun roadmap.";
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

      onRoadmapComplete(data.result);

      // Parse some dummy tasks dynamically so they have custom interactive checklists
      setChecklist([
        { id: 1, text: `Ulas Konsep Inti (Big Idea) dari '${topic}'`, completed: false },
        { id: 2, text: `Terapkan Teknik Pomodoro untuk membaca 15 menit awal`, completed: false },
        { id: 3, text: `Evaluasi diri lewat Sesi Kuis Bertahap`, completed: false },
        { id: 4, text: `Coba jelaskan materi '${topic}' ke sirkel/teman belajar`, completed: false },
        { id: 5, text: `Review glosarium kata kunci sulit ${topic}`, completed: false },
      ]);
    } catch (err: any) {
      setError(err.message || "Aduh, gagal membuat pembelajaran terstruktur brosis.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = checklist.filter((x) => x.completed).length;
  const progressPercent = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">AI Learning Roadmap</h3>
            <p className="text-xs text-slate-400">Peta jalan terarah lengkap dengan teknik Feynman & Pomodoro</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Target prompt builder */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Penguasaan Skill/Materi</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetTopic}
            onChange={(e) => setTargetTopic(e.target.value)}
            placeholder={materialTitle ? `Gunakan materi aktif: ${materialTitle}` : "Contoh: Jago Reaksi Fotosintesis dalam 3 Hari"}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] text-sm"
          />
          <button
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-sm shadow-[#7C3AED]/10"
            id="btn-build-roadmap"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Menyusun..." : "Buat Roadmap"}
          </button>
        </div>
      </div>

      {/* RENDER BODY */}
      {loading ? (
        <div className="py-16 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#7C3AED]/10 border-t-[#7C3AED] rounded-full animate-spin"></div>
            <Compass className="w-5 h-5 text-[#7C3AED] absolute top-3.5 left-3.5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 animate-pulse">Menghitung Peta Navigasi Otak...</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Merancang tahapan belajar harian & merekomendasikan metode Pomodoro yang pas untuk porsi otak gampang fokus.
            </p>
          </div>
        </div>
      ) : savedRoadmap ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Detailed Roadmap Column (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 text-[#7C3AED] text-xs font-semibold rounded-lg w-max select-none">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce"></span>
              Metodologi Belajar Mandiri Terpapar
            </div>

            <div className="prose prose-indigo max-w-none text-slate-700 border border-slate-100 bg-slate-50/40 p-5 rounded-2xl">
              <div className="markdown-body text-xs md:text-sm">
                <Markdown>{savedRoadmap}</Markdown>
              </div>
            </div>
          </div>

          {/* Interactive Checklist Column (Span 1) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 h-max">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 font-bold">
              <ClipboardList className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Interactive checklist</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Pencapaian Belajar</span>
                <span className="font-bold font-mono text-[#7C3AED]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div
                  className="bg-[#7C3AED] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {checklist.map((item) => (
                <button
                   key={item.id}
                   onClick={() => toggleCheck(item.id)}
                   className="w-full text-left flex items-start gap-2 text-xs text-slate-600 hover:text-slate-800 transition-colors p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-xs cursor-pointer focus:outline-none"
                >
                  <span className="shrink-0 pt-0.5 select-none animate-scale-up">
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </span>
                  <span className={item.completed ? "line-through text-slate-400 font-medium" : "font-semibold"}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100/80 text-[10px] text-[#7C3AED] text-center select-none font-bold">
              💡 Centang tugas setiap hari untuk menjaga rentetan fokusmu! Keep up the spirit sob!
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-sm italic">
          Gunakan formulir di atas untuk menggenerasikan rencana belajar cerdasmu brosis!
        </div>
      )}
    </div>
  );
};
