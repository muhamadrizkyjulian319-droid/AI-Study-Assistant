export interface PresetMaterial {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanations: string[];
}

export interface StudyDashboard {
  materiAktif: string;
  pemahamanKonsep: number; // 0 - 100
  status: "Belum Belajar" | "Butuh Review" | "Cukup" | "Siap Ujian";
  kuisTerakhir: string;
  teknikBelajarDisarankan: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
