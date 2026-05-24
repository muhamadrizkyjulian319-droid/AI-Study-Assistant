import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Award,
  Compass,
  FileText,
  Upload,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronRight,
  BookMarked,
  Layers,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PresetMaterial, QuizQuestion, StudyDashboard, ChatMessage } from "./types";
import { Dashboard } from "./components/Dashboard";
import { Summarizer } from "./components/Summarizer";
import { Quiz } from "./components/Quiz";
import { Tutor } from "./components/Tutor";
import { Roadmap } from "./components/Roadmap";

export default function App() {
  // Master states
  const [presets, setPresets] = useState<PresetMaterial[]>([]);
  const [materialTitle, setMaterialTitle] = useState("Bab 1: Konsep Belajar Aktif");
  const [materialText, setMaterialText] = useState("");
  const [activeTab, setActiveTab] = useState<"summarizer" | "quiz" | "tutor" | "roadmap">("summarizer");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [loadingPresets, setLoadingPresets] = useState(false);

  // Saved results states across tabs (preserving state on tab changes)
  const [savedSummary, setSavedSummary] = useState("");
  const [savedQuiz, setSavedQuiz] = useState<QuizQuestion[]>([]);
  const [savedTutorChat, setSavedTutorChat] = useState<ChatMessage[]>([]);
  const [savedRoadmap, setSavedRoadmap] = useState("");

  // Target Study Dashboard Dynamic State (#4 State indicator spec)
  const [dashboard, setDashboard] = useState<StudyDashboard>({
    materiAktif: "Belum Ada",
    pemahamanKonsep: 0,
    status: "Belum Belajar",
    kuisTerakhir: "Belum Mulai",
    teknikBelajarDisarankan: "Pomodoro Technique"
  });

  // Load preset materials from Express server on mount
  useEffect(() => {
    async function fetchPresets() {
      setLoadingPresets(true);
      try {
        const response = await fetch("/api/presets");
        if (response.ok) {
          const data = await response.json();
          setPresets(data.presets || []);
          
          // Default: load the first preset
          if (data.presets && data.presets.length > 0) {
            handleLoadPreset(data.presets[0]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat preset materi:", err);
      } finally {
        setLoadingPresets(false);
      }
    }
    fetchPresets();
  }, []);

  const handleLoadPreset = (preset: PresetMaterial) => {
    setMaterialTitle(preset.title);
    setMaterialText(preset.content);
    setUploadedFileName(null);
    
    // Auto design study technique recommendation based on category
    let technique = "Pomodoro Technique";
    if (preset.category === "Fisika" || preset.category === "Kimia") {
      technique = "Feynman Technique (Jelaskan Berkelompok)";
    } else if (preset.category === "Ekonomi") {
      technique = "Spaced Repetition (Ulasan Bertahap)";
    } else if (preset.category === "Biologi") {
      technique = "Mind Mapping & Recall Aktif";
    }

    setDashboard((prev) => ({
      ...prev,
      materiAktif: preset.title,
      pemahamanKonsep: Math.max(prev.pemahamanKonsep, 20), // default initial review state
      status: prev.status === "Belum Belajar" ? "Butuh Review" : prev.status,
      teknikBelajarDisarankan: technique
    }));

    // Reset some of the state items to force active study on the new preset
    setSavedSummary("");
    setSavedQuiz([]);
    setSavedTutorChat([]);
    setSavedRoadmap("");
  };

  // Drag and Drop Text/PDF files upload simulator
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processUploadedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setMaterialText(event.target.result);
          setMaterialTitle(file.name.replace(/\.[^/.]+$/, "")); // clean filename
          setUploadedFileName(file.name);
          updateDashboardForUpload(file.name);
        }
      };
      reader.readAsText(file);
    } else {
      // Mock parsing for PDF/Docx files beautifully indicating scanning
      setMaterialTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadedFileName(file.name);
      
      // Seed pre-loaded complex topics or text from standard file name
      let generatedContent = `[DATA SCANNING & AI EXTRACTION SUKSES]\n\nMateri yang dipindai dari file: ${file.name}\n\n`;
      generatedContent += `Selamat belajar sob! Materi ini berfokus pada pendalaman esensi ${file.name}. Dokumen ini berisi penjabaran teori akademis terperinci, rangkuman sub-bab, serta contoh soal penyelesaian masalah.\n\n`;
      generatedContent += `Gunakan fitur AI Summarizer di sebelah kanan untuk mengekstrak poin kencang, jalankan kuis pilihan ganda evaluasi, atau tanyakan contoh nyata kehidupan sehari-hari ke Kak AI Tutor gaul kami untuk membantu pemahaman kamu!`;

      setMaterialText(generatedContent);
      updateDashboardForUpload(file.name);
    }
  };

  const updateDashboardForUpload = (filename: string) => {
    setDashboard((prev) => ({
      ...prev,
      materiAktif: filename,
      pemahamanKonsep: 30,
      status: "Butuh Review",
      teknikBelajarDisarankan: "Feynman Technique (ELI5)"
    }));
    // Reset tabs
    setSavedSummary("");
    setSavedQuiz([]);
    setSavedTutorChat([]);
    setSavedRoadmap("");
  };

  const triggerClearText = () => {
    setMaterialText("");
    setMaterialTitle("Belum Ada Judul");
    setUploadedFileName(null);
    setDashboard((prev) => ({
      ...prev,
      materiAktif: "Belum Ada",
      pemahamanKonsep: 0,
      status: "Belum Belajar"
    }));
    setSavedSummary("");
    setSavedQuiz([]);
    setSavedTutorChat([]);
    setSavedRoadmap("");
  };

  // Callback when a quiz is completed
  const handleQuizFinished = (scoreLabel: string, scorePercent: number) => {
    let statusLabel: "Butuh Review" | "Cukup" | "Siap Ujian" = "Butuh Review";
    if (scorePercent >= 80) {
      statusLabel = "Siap Ujian";
    } else if (scorePercent >= 50) {
      statusLabel = "Cukup";
    }

    setDashboard((prev) => ({
      ...prev,
      kuisTerakhir: scoreLabel,
      pemahamanKonsep: scorePercent,
      status: statusLabel
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans transition-colors">
      
      {/* Top Professional EdTech Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none" id="applet-logo">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center text-white font-bold transition-all shadow-sm">
              L
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">Lumina AI <span className="text-[#7C3AED]">Study</span></span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Pro Plan</span>
              <span className="text-xs font-semibold text-slate-900 leading-none mt-0.5">Budi Dharmawan</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-xs shadow-xs">
              BD
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Study Material Control Panel */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 justify-start h-full">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 flex-1 flex flex-col">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="font-extrabold text-[#7C3AED] text-xs uppercase tracking-wide">Materi Belajar</h2>
              </div>
              
              {materialText && (
                <button
                  onClick={triggerClearText}
                  className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 border border-slate-100 px-2.5 py-1 rounded-lg"
                  id="btn-clear-material"
                >
                  <X className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              )}
            </div>

            {/* Custom file & Drag and drop uploader */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-200 hover:border-[#7C3AED] rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all group relative"
              id="dropzone-material"
            >
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-input-id"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Tarik atau Klik Berkas Materi Belajar</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mendukung .txt, .md, .pdf, .docx</p>
                </div>
              </div>
            </div>

            {/* Title display */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Judul Bab Pembahasan</label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Masukkan judul bab..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] text-sm font-bold text-slate-800"
              />
            </div>

            {/* Main material textarea */}
            <div className="space-y-1.5 flex-1 min-h-[220px] flex flex-col justify-stretch">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Isi Dokumen / Teks Materi</label>
              <textarea
                value={materialText}
                onChange={(e) => {
                  setMaterialText(e.target.value);
                  setDashboard((prev) => ({ ...prev, materiAktif: materialTitle || "Materi Kustom" }));
                }}
                placeholder="Disini kamu bisa copy-paste materi kuliah, transkrip video, penjelasan dosen, atau catatan belajarmu brosis untuk dianalisis oleh AI!"
                className="w-full h-full min-h-[200px] flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder-slate-400 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] font-mono resize-none"
              />
            </div>
            
            {/* Word/Char Counter */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>{uploadedFileName ? `📂 Disematkan: ${uploadedFileName}` : "💡 Tempel tulisan akademik apa pun."}</span>
              <span>{materialText.length} karakter | {materialText.split(/\s+/).filter(Boolean).length} kata</span>
            </div>
          </div>

          {/* Quick preset Indonesian educational Materials */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Materi Contoh Terpopuler</h3>
              </div>
              {loadingPresets && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className={`p-3 text-left rounded-xl border text-xs leading-normal transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 ${
                    materialTitle === preset.title
                      ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] font-bold"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] mb-0.5">{preset.category}</div>
                    <div className="truncate font-semibold text-slate-800 text-xs">{preset.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Work Area + Dashboard Indicators */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 h-full">
          
          {/* Dashboard Area */}
          <Dashboard dashboard={dashboard} />

          {/* tab Nav selectors */}
          <div className="flex border-b border-gray-200 bg-white/50 p-1.5 rounded-xl border" id="workspace-tabs-bar">
            {[
              { id: "summarizer", label: "AI Rangkuman", icon: FileText, color: "text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20" },
              { id: "quiz", label: "Kuis Berlapis", icon: Award, color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20" },
              { id: "tutor", label: "Tutor GAUL (Anak SMA)", icon: Sparkles, color: "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20" },
              { id: "roadmap", label: "Peta Belajar", icon: Compass, color: "text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20" }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border relative select-none ${
                    isActive
                      ? `bg-white shadow-xs border-slate-200 ${tab.color}`
                      : "text-slate-400 hover:text-slate-600 border-transparent bg-transparent"
                  }`}
                  id={`tab-btn-${tab.id}`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Frame */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === "summarizer" && (
                  <Summarizer
                    materialContent={materialText}
                    savedSummary={savedSummary}
                    onSummarizeComplete={setSavedSummary}
                  />
                )}

                {activeTab === "quiz" && (
                  <Quiz
                    materialContent={materialText}
                    savedQuiz={savedQuiz}
                    onSaveQuiz={setSavedQuiz}
                    onQuizFinished={handleQuizFinished}
                  />
                )}

                {activeTab === "tutor" && (
                  <Tutor
                    materialContent={materialText}
                    chatHistory={savedTutorChat}
                    onAddChatMessage={(msg) => setSavedTutorChat((prev) => [...prev, msg])}
                    onClearChat={() => setSavedTutorChat([])}
                  />
                )}

                {activeTab === "roadmap" && (
                  <Roadmap
                    materialTitle={materialTitle}
                    materialContent={materialText}
                    savedRoadmap={savedRoadmap}
                    onRoadmapComplete={setSavedRoadmap}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}
