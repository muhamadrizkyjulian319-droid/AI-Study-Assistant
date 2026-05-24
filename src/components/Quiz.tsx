import React, { useState } from "react";
import { Award, CheckCircle2, XCircle, ArrowRight, Sparkles, HelpCircle, AlertTriangle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizQuestion, StudyDashboard } from "../types";

interface QuizProps {
  materialContent: string;
  onQuizFinished: (scoreLabel: string, scorePercent: number) => void;
  savedQuiz: QuizQuestion[];
  onSaveQuiz: (quiz: QuizQuestion[]) => void;
}

export const Quiz: React.FC<QuizProps> = ({
  materialContent,
  onQuizFinished,
  savedQuiz,
  onSaveQuiz,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizType, setQuizType] = useState<"multiple_choice" | "flashcards">("multiple_choice");
  
  // Quiz Live States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; correct: boolean; chosenOption: number }[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const startQuizGeneration = async () => {
    if (!materialContent || materialContent.trim().length === 0) {
      setError("Silakan lengkapi materi belajar di panel sebelah kiri terlebih dulu!");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setHasAnswered(false);
    setAnswersLog([]);
    setQuizComplete(false);
    setCurrentIndex(0);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: materialContent, quizType }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errMessage = "Gagal berkomunikasi dengan server kuis.";
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

      if (!data.quiz || !Array.isArray(data.quiz) || data.quiz.length === 0) {
        throw new Error("Format materi belum bisa dianalisis dengan baik oleh AI. Silakan coba materi lain!");
      }

      onSaveQuiz(data.quiz);
    } catch (err: any) {
      setError(err.message || "Aduh, gagal men-generate kuis sob. Pastikan API key sudah dipasang.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = savedQuiz[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return; // Prevent multiple guesses
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasAnswered) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setAnswersLog((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        correct: isCorrect,
        chosenOption: selectedOption,
      },
    ]);
    setHasAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < savedQuiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Quiz finished!
      setQuizComplete(true);
      const correctCount = answersLog.filter((log) => log.correct).length;
      const pct = Math.round((correctCount / savedQuiz.length) * 100);
      onQuizFinished(`Skor ${correctCount}/${savedQuiz.length} (${pct}%)`, pct);
    }
  };

  const totalCorrect = answersLog.filter((log) => log.correct).length;

  // Identify wrong answers for the Coral Orange warnings panel (#3 Spec)
  const getIncorrectQuestions = () => {
    return savedQuiz.filter((q) => {
      const log = answersLog.find((l) => l.questionId === q.id);
      return log && !log.correct;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">AI Quiz Generator</h3>
            <p className="text-xs text-slate-400">Uji kemampuan & evaluasi tingkat penyerapan materi</p>
          </div>
        </div>

        {!savedQuiz.length && !loading && (
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setQuizType("multiple_choice")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all select-none ${
                quizType === "multiple_choice"
                  ? "bg-white text-[#10B981] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-quiz-mc"
            >
              Pilihan Ganda
            </button>
            <button
              onClick={() => setQuizType("flashcards")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all select-none ${
                quizType === "flashcards"
                  ? "bg-white text-[#10B981] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-quiz-fc"
            >
              Flashcards
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* BEFORE QUIZ GENERATED */}
      {!savedQuiz.length && !loading && (
        <div className="py-12 flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
          <div className="p-4 bg-[#10B981]/10 text-[#10B981] rounded-2xl animate-pulse">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Kuis Evaluasi Aktif</h4>
            <p className="text-sm text-slate-400 mt-1">
              AI akan menyusun 5 pertanyaan yang didesain presisi menguji detail terdalam dari bahan belajarmu.
            </p>
          </div>
          <button
            onClick={startQuizGeneration}
            className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-[#10B981]/10 cursor-pointer flex items-center gap-2"
            id="btn-generate-quiz"
          >
            <Sparkles className="w-4 h-4" />
            Ronce Kuis Sekarang 📈
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="py-16 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#10B981]/10 border-t-[#10B981] rounded-full animate-spin"></div>
            <Award className="w-5 h-5 text-[#10B981] absolute top-3.5 left-3.5 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 animate-pulse">Menyusun Bank Soal Cerdas...</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Meramu pertanyaan pilihan ganda & kunci penjelasan mendalam berdasarkan topik aktifmu brosis!
            </p>
          </div>
        </div>
      )}

      {/* QUIZ ACTIVE STATE */}
      {savedQuiz.length > 0 && !quizComplete && currentQuestion && (
        <div className="space-y-6">
          {/* Progress Tracker (Questions One-by-One constraint) */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
              Soal {currentIndex + 1} dari {savedQuiz.length}
            </span>
            <span className="font-semibold text-[#10B981]">
              Progres Kuis: {Math.round(((currentIndex) / savedQuiz.length) * 100)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full">
            <div
              className="bg-[#10B981] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / savedQuiz.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Pertanyaan</span>
            <h4 className="text-base font-bold text-slate-800 leading-relaxed">
              {currentQuestion.question}
            </h4>
          </div>

          {/* Options Display */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => {
              // Styling states
              let buttonStyle = "border-slate-100 hover:border-[#10B981]/40 hover:bg-[#10B981]/5";
              let iconElement = null;

              if (selectedOption === i && !hasAnswered) {
                // Pre-submit highlighted state
                buttonStyle = "border-[#10B981] bg-[#10B981]/5 text-slate-800";
              }

              if (hasAnswered) {
                if (i === currentQuestion.correctIndex) {
                  // The correct answer always highlights in green
                  buttonStyle = "border-[#10B981] bg-emerald-50 text-slate-900";
                  iconElement = <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />;
                } else if (selectedOption === i) {
                  // User chose this and it was wrong
                  buttonStyle = "border-[#F97316] bg-orange-50 text-orange-900";
                  iconElement = <XCircle className="w-5 h-5 text-[#F97316] shrink-0" />;
                } else {
                  // Unselected non-correct options get dimmed
                  buttonStyle = "border-slate-100 bg-slate-50/30 text-slate-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={i}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(i)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border shrink-0 ${
                      selectedOption === i && !hasAnswered
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : hasAnswered && i === currentQuestion.correctIndex
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : hasAnswered && selectedOption === i
                        ? "bg-[#F97316] text-white border-[#F97316]"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            {!hasAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 ${
                  selectedOption === null
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white shadow-md shadow-[#10B981]/10 cursor-pointer"
                }`}
                id="btn-submit-answer"
              >
                <span>Konfirmasi Jawaban</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                id="btn-next-question"
              >
                <span>{currentIndex === savedQuiz.length - 1 ? "Selesaikan Kuis" : "Soal Selanjutnya"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Explanation revealed AFTER student answers (Active Feedback constraint) */}
          <AnimatePresence>
            {hasAnswered && selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-5 rounded-2xl border text-sm space-y-2.5 ${
                  selectedOption === currentQuestion.correctIndex
                    ? "bg-emerald-50/40 border-emerald-200 text-slate-700"
                    : "bg-orange-50/40 border-orange-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <span className="text-[#10B981] flex items-center gap-1 leading-none select-none">
                      🎉 Mantap, Keren Banget!
                    </span>
                  ) : (
                    <span className="text-[#F97316] flex items-center gap-1 leading-none select-none">
                      😓 Waduh, Kurang Tepat Sob!
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-xs text-slate-600">
                  <strong className="font-bold text-slate-700">Pembahasan:</strong>{" "}
                  {currentQuestion.explanations[selectedOption] ||
                    "Tidak ada detail penjelasan spesifik. Yang benar adalah opsi bermarka centang hijau."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* QUIZ COMPLETED PAGE */}
      {quizComplete && (
        <div className="space-y-6">
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center space-y-4 animate-fade-in animate-duration-300">
            <div className={`p-4 rounded-full ${totalCorrect >= 4 ? "bg-emerald-100 text-[#10B981]" : "bg-purple-100 text-[#7C3AED]"}`}>
              <Award className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800">Kuis Berhasil Diselesaikan! Code Gg!</h4>
              <p className="text-xs text-slate-400 mt-1">Kamu telah menyelesaikan seluruh set pertanyaan evaluasi.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-xs pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none mb-1">Skor Kamu</div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {Math.round((totalCorrect / savedQuiz.length) * 100)}%
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none mb-1">Benar / Total</div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {totalCorrect} / {savedQuiz.length}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={startQuizGeneration}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-[#10B981]/15"
                id="btn-quiz-retry"
              >
                🔄 Ulangi Kuis
              </button>
              <button
                onClick={() => {
                  onSaveQuiz([]);
                  setQuizComplete(false);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer bg-white shadow-xs"
                id="btn-quiz-new-preset"
              >
                Pilih Kuis Lain
              </button>
            </div>
          </div>

          {/* Coral Orange WARNING Alert panel for incorrect answers (Required Spec #3) */}
          <div className="border border-orange-200 bg-orange-50/40 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 select-none">
              <AlertTriangle className="w-5 h-5 text-[#F97316] shrink-0" />
              <h4 className="font-bold text-[#F97316] text-sm">
                Fokus Review (Coral Orange Alert! Materi Sering Salah Dijawab)
              </h4>
            </div>

            {getIncorrectQuestions().length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Awesome! Gak ada materi yang salah dijawab brosis. Pemahaman konsep kamu jaya di awang-awang (100% Siap Ujian)!
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Berikut konsep-konsep krusial dari materi ini yang masih belum kamu kuasai sepenuhnya. Sebaiknya ulas sekali lagi menggunakan AI Tutor:
                </p>
                <div className="space-y-2.5">
                  {getIncorrectQuestions().map((q, idx) => {
                    const log = answersLog.find((l) => l.questionId === q.id);
                    return (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-orange-100 text-xs text-slate-700 space-y-1.5 shadow-xs">
                        <div className="font-semibold text-slate-800">
                          🔴 Salah jawab di topik soal: "{q.question.substring(0, 80)}..."
                        </div>
                        <div className="text-slate-500 font-medium">
                          Jawaban kamu: <span className="text-[#F97316] font-bold">{q.options[log?.chosenOption ?? 0]}</span>
                        </div>
                        <div className="text-[#10B981] font-bold bg-[#10B981]/5 px-2.5 py-1 rounded w-max mt-1 text-[10px] uppercase">
                          Kunci Benar: {q.options[q.correctIndex]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
