import React from "react";
import { BookOpen, Award, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { StudyDashboard } from "../types";

interface DashboardProps {
  dashboard: StudyDashboard;
  onUpdateMetric?: (metric: Partial<StudyDashboard>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ dashboard, onUpdateMetric }) => {
  // Determine color matching status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Siap Ujian":
        return "bg-emerald-50 text-[#10B981] border-emerald-100 select-none font-bold";
      case "Cukup":
        return "bg-purple-50 text-[#7C3AED] border-purple-100 select-none font-bold";
      case "Butuh Review":
        return "bg-orange-50 text-[#F97316] border-orange-100 select-none font-bold";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200 select-none";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-[#10B981]";
    if (score >= 50) return "bg-[#7C3AED]";
    return "bg-[#F97316]";
  };

  return (
    <div className="space-y-4">
      {/* Required section #4 blockquote style format output */}
      <div className="border-l-4 border-[#7C3AED] bg-[#7C3AED]/5 p-5 rounded-2xl border border-slate-100/80 shadow-xs">
        <blockquote className="text-slate-700 text-xs md:text-sm italic font-mono space-y-1.5 animate-fade-in">
          <div className="font-bold text-[#7C3AED] not-italic flex items-center gap-1.5 mb-1.5 select-none text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-[#7C3AED] animate-pulse" />
            [STUDY DASHBOARD]
          </div>
          <p>• 📖 <strong className="font-bold text-slate-800 not-italic">Materi Aktif:</strong> <span className="text-slate-700 not-italic">{dashboard.materiAktif}</span></p>
          <p>• 🧠 <strong className="font-bold text-slate-800 not-italic">Pemahaman Konsep:</strong> <span className="text-slate-700 not-italic">{dashboard.pemahamanKonsep}%</span> | Status: <span className="not-italic">{dashboard.status}</span></p>
          <p>• 📝 <strong className="font-bold text-slate-800 not-italic">Kuis Terakhir:</strong> <span className="text-[#F97316] font-bold not-italic font-mono">{dashboard.kuisTerakhir}</span></p>
          <p>• ⏳ <strong className="font-bold text-slate-800 not-italic">Teknik Belajar Disarankan:</strong> <span className="text-[#7C3AED] font-bold not-italic font-mono">{dashboard.teknikBelajarDisarankan}</span></p>
        </blockquote>
      </div>

      {/* Visual Rich Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Widget 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Materi Aktif</div>
            <div className="text-xs font-bold text-slate-800 truncate" title={dashboard.materiAktif}>
              {dashboard.materiAktif}
            </div>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Pemahaman</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2 mt-1">
                <span>{dashboard.pemahamanKonsep}%</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getStatusColor(dashboard.status)}`}>
                  {dashboard.status}
                </span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(dashboard.pemahamanKonsep)}`}
              style={{ width: `${dashboard.pemahamanKonsep}%` }}
            ></div>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#10B981]/10 text-[#10B981] rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kuis Terakhir</div>
            <div className="text-xs font-bold text-slate-800">
              {dashboard.kuisTerakhir}
            </div>
          </div>
        </div>

        {/* Widget 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-[#F97316]/10 text-[#F97316] rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teknik Belajar</div>
            <div className="text-xs font-bold text-[#F97316] font-mono leading-tight">
              {dashboard.teknikBelajarDisarankan}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
