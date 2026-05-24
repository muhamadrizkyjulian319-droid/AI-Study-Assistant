import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Custom Lazy-load pattern for Google GenAI to avoid crashing if API key is not present initially
let aiInstance: GoogleGenAI | null = null;

function getAIAgent(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please define it in your Secrets / environment variables panel."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// PRESET INDONESIAN ACADEMIC MATERIALS FOR QUICK TESTING
const PRESET_MATERIALS = [
  {
    id: "fotosintesis",
    title: "Fotosintesis: Reaksi Terang & Reaksi Gelap",
    category: "Biologi",
    content: `Fotosintesis adalah reaksi kimia kompleks di mana tumbuhan hijau mengubah karbon dioksida dan air menjadi zat gula (glukosa) dan oksigen dengan bantuan energi cahaya matahari. Proses ini berlangsung terutama di organel kloroplas daun yang memiliki pigmen menangkap cahaya yaitu klorofil. 

Fotosintesis dibagi menjadi dua tahap utama:
1. Reaksi Terang (Light-Dependent Reactions): 
Tahap ini wajib membutuhkan cahaya matahari langsung. Berlangsung di tumpukan membran tilakoid kloroplas (grana). Di sini, molekul air (H2O) dipecah melalui proses fotolisis menjadi gas oksigen (O2) yang dilepaskan ke udara, proton (H+), dan elektron. Energi dari cahaya matahari ditangkap klorofil untuk menghasilkan produk penyimpan energi kimia sementara berupa ATP (Adenosin Trifosfat) dan NADPH (Nikotinamida Adenina Dinukleotida Fosfat).

2. Reaksi Gelap atau Siklus Calvin (Light-Independent Reactions):
Tahap ini tidak memerlukan cahaya langsung, tetapi sangat tergantung pendelegasian ATP dan NADPH dari reaksi terang. Berlangsung di stroma (cairan pengisi kloroplas). Pada siklus ini terjadi penggabungan CO2 dari udara bebas ke molekul organik lewat bantuan enzim sitosol RuBisCO (fiksasi karbon), yang kemudian direduksi menggunakan elektron dari NADPH dan energi ATP untuk diubah menjadi senyawa glukosa (gula berenergi tinggi). Glukosa inilah yang menjadi makanan pokok bagi tumbuhan untuk tumbuh kembang, dan sisanya disimpan di buah/umbi.`
  },
  {
    id: "relativitas",
    title: "Teori Relativitas Khusus Albert Einstein",
    category: "Fisika",
    content: `Dipelopori oleh Albert Einstein pada tahun 1905, Teori Relativitas Khusus merevolusi pemahaman klasik kita tentang ruang, waktu, dan massa. Teori ini berlandaskan pada dua postulat utama:
1. Hukum-hukum fisika adalah sama untuk semua pengamat yang berada dalam kerangka acuan inersia yang sama (tidak mengalami percepatan).
2. Laju kecepatan cahaya di dalam ruang hampa udara (c = 3 x 10^8 m/s) bernilai mutlak konstan bagi semua pengamat, terlepas dari kecepatan relatif sumber cahaya tersebut ataupun kecepatan pengamat.

Akibat dari postulat-postulat ini memunculkan fenomena fisika modern yang mustahil ditemui pada kecepatan rendah sehari-hari:
- Dilatasi Waktu (Time Dilation): Waktu berjalan lebih lambat bagi pengamat yang bergerak dengan kecepatan mendekati kecepatan cahaya dibandingkan pengamat yang diam. Contohnya adalah kisah paradoks kembar (Twin Paradox).
- Kontraksi Panjang (Lorentz Contraction): Objek yang melaju mendekati kecepatan cahaya akan tampak memendek searah dengan arah gerakannya jika diukur oleh pengamat yang diam.
- Relativitas Massa dan Massa-Energi (E = mc^2): Massa sebuah objek bertambah seiring kecepatannya bertambah. Pada puncaknya, massa dan energi adalah entitas yang setara. Energi yang terkandung didalam sebuah materi adalah massa dikali kuadrat dari kecepatan cahaya, membuktikan bahwa energi yang sangat dashyat tersimpan di atom terkecil sekalipun.`
  },
  {
    id: "kuantum-atom",
    title: "Perkembangan Struktur Atom & Teori Kuantum",
    category: "Kimia",
    content: `Perjalanan penemuan struktur terkecil pembentuk materi yaitu atom bergulir sepanjang sejarah ilmiah modern:
1. Model Atom John Dalton (1803): Digambarkan sebagai bola pejal yang sangat keras, tidak dapat dibagi lagi, diciptakan, atau dimusnahkan.
2. Model Bola Kismis J.J. Thomson (1897): Setelah menemukan partikel bermuatan negatif (elektron), Thomson menyimpulkan atom adalah bola bermuatan positif yang ditaburi kismis elektron bermuatan negatif di bagian permukaannya.
3. Model Atom Rutherford (1911): Berdasarkan eksperimen hamburan sinar alfa, Rutherford mengemukakan bahwa sebagian besar atom terdiri dari ruang kosong dengan inti bermuatan positif di pusat dan elektron mengelilinginya.
4. Model Lintasan Bohr (1913): Niels Bohr menerapkan prinsip kuantum di mana elektron mengelilingi inti seperti planet mengitari matahari pada lintasan energi (kulit) tertentu tanpa melepas radiasi. Elektron bisa berpindah kulit (eksitasi/deeksitasi) dengan menyerap/melepas energi berupa kuanta cahaya (foton).
5. Mekanika Kuantum Modern (Schrodinger & Heisenberg): Elektron tidak mengelilingi inti pada lintasan melingkar yang pasti. Berdasarkan teori Dualisme Gelombang-Partikel De Broglie dan Prinsip Ketidakpastian Heisenberg, posisi elektron tidak bisa diukur tepat 100%. Kita hanya bisa memperkirakan peluang terbesar keberadaan elektron di ruang tertentu yang dinamakan Orbital (Awan Elektron).`
  },
  {
    id: "ekonomi-mikro",
    title: "Hukum Permintaan, Penawaran & Ekuilibrium Pasar",
    category: "Ekonomi",
    content: `Dalam studi Ekonomi Mikro, interaksi pasar didorong oleh pembeli (konsumen) dan penjual (produsen) yang tercermin pada kurva hukum berikut:

- Hukum Permintaan (Law of Demand): 
Semua hal lain dianggap konstan (ceteris paribus), semakin tinggi harga suatu barang, semakin sedikit jumlah barang yang akan diminta oleh konsumen. Sebaliknya, jika harga suatu barang turun, maka keinginan membeli barang tersebut akan bertambah karena daya beli relatif meningkat. Kurva permintaan memiliki kemiringan kemiringan negatif (dari kiri atas ke kanan bawah).

- Hukum Penawaran (Law of Supply):
Ceteris paribus, semakin tinggi harga suatu barang atau jasa, semakin banyak jumlah barang atau jasa yang ditawarkan oleh produsen karena mereka berupaya memaksimalkan laba. Sebaliknya, jika harga jatuh, produsen akan mengurangi jumlah produksinya lantaran potensi profit mengecil. Kurva penawaran memiliki kemiringan positif (dari kiri bawah ke kanan atas).

- Titik Ekuilibrium (Harga Keseimbangan Jual-Beli):
Pasar akan mencapai kondisi keseimbangan jika kuantitas barang yang diminta oleh pembeli sama persis dengan kuantitas yang ditawarkan oleh produsen pada tingkat harga tertentu. Titik temu antara kurva permintaan dan kurva penawaran inilah yang melahirkan Harga Keseimbangan Pasar. Jika harga berada di atas ekuilibrium, terjadi surplus barang (kelebihan stok). Sebaliknya, jika harga di bawah ekuilibrium akan menyebabkan kelangkaan barang (shortage).`
  }
];

// GET PRESET LIST
app.get("/api/presets", (req, res) => {
  res.json({ presets: PRESET_MATERIALS });
});

// 1. AI PDF SUMMARIZER ENDPOINT
app.post("/api/summarize", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Konten materi tidak boleh kosong!" });
    }

    const ai = getAIAgent();
    
    const prompt = `Kamu adalah dosen ahli dan pakar pembuat ringkasan materi akademik (pedagogi).
Tugasmu adalah membuat ringkasan yang komprehensif, padat, dan sangat mudah dipahami berdasarkan materi berikut:
"${content}"

Struktur ringkasan HARUS mengikuti format Markdown dengan pembagian:
1. **Konsep Inti (Big Idea)**: Berikan penjelasan ringkas (2-3 kalimat) mengenai inti dari materi ini.
2. **Poin Kunci (Bullet Points)**: Ambil 5-8 poin esensial penting dari materi ini, berikan penjelasan singkat di masing-masing poin.
3. **Glosarium Istilah Sulit**: Buat sebuah tabel Markdown dengan kolom 'Istilah' dan 'Definisi Sederhana' berisi minimal 3-5 istilah krusial atau kata sulit/asing dari materi di atas beserta artinya.

Gunakan tone yang bersahabat, terstruktur, rapi, dan bantu mahasiswa memetakan materi secara visual dengan poin-poin yang scannable. Pastikan output menggunakan Bahasa Indonesia yang baik dan menarik.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const resultMarkdown = response.text || "Gagal menghasilkan ringkasan.";
    res.json({ result: resultMarkdown });
  } catch (err: any) {
    console.error("Error at /api/summarize:", err);
    res.status(500).json({ error: err.message || "Terjadi kesalahan internal server." });
  }
});

// 2. AI QUIZ GENERATOR ENDPOINT
app.post("/api/quiz", async (req, res) => {
  try {
    const { content, quizType } = req.body;
    const type = quizType || "multiple_choice";
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Konten materi tidak boleh kosong untuk membuat kuis!" });
    }

    const ai = getAIAgent();

    const isFlashcard = type === "flashcards";
    const typeInstructions = isFlashcard
      ? "Kuis Flashcards: Buatlah pertanyaan konseptual singkat. Kolom 'options' harus berisi persis dua pilihan: [\"Lihat Jawaban\", \"Saya Sudah Paham\"]. Indeks correctIndex melambangkan pilihan yang mengungkap kebenaran yaitu indeks 0. Bagian 'explanations' indeks 0 berisi ringkasan jawaban kunci super padat yang menjelaskan definisi atau penjelasan di balik konsep tersebut agar siswa belajar mandiri."
      : "Kuis Pilihan Ganda: Berikan 4 pilihan unik (A, B, C, D) di dalam array 'options'. Atur 'correctIndex' ke indeks pilihan yang benar (0 untuk pilihan pertama, 1 untuk kedua, dst). Penjelasan didalam array 'explanations' wajib diisi untuk MASING-MASING pilihan di indeks yang cocok secara spesifik dan penuh penjelasan asyik.";

    const prompt = `Buatlah 5 pertanyaan kuis interaktif berdasarkan materi berikut:
"${content}"

Materi ini adalah landasan kuis. Tipe kuis yang diminta: ${type}.
${typeInstructions}

Format respons HARUS berupa JSON array dengan skema berikut:
[
  {
    "id": 1,
    "question": "Pertanyaan mengenai konsep...",
    "options": ["Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4"],
    "correctIndex": 0,
    "explanations": [
      "Penjelasan rinci mengapa Opsi 1 BENAR atau SALAH...",
      "Penjelasan rinci mengapa Opsi 2 BENAR atau SALAH...",
      "Penjelasan rinci mengapa Opsi 3 BENAR atau SALAH...",
      "Penjelasan rinci mengapa Opsi 4 BENAR atau SALAH..."
    ]
  }
]

Pastikan semua pertanyaan bermutu akademis baik tetapi ditulis secara ramah, menantang akal sehat mahasiswa, dan penjelasan solusinya bernilai edukasi tinggi. Kembalikan HANYA JSON data mentah tanpa pembungkus markdown penanda \`\`\`json \`\`\`.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "question", "options", "correctIndex", "explanations"]
          }
        },
        temperature: 0.8
      }
    });

    const quizText = response.text || "[]";
    const quizData = JSON.parse(quizText.trim());
    res.json({ quiz: quizData });
  } catch (err: any) {
    console.error("Error at /api/quiz:", err);
    res.status(500).json({ error: err.message || "Terjadi kesalahan generating kuis." });
  }
});

// 3. AI TUTOR (KONSEP ANAK SMA / ELI5 VERSI REMAJA INDONESIA)
app.post("/api/tutor", async (req, res) => {
  try {
    const { content, query, chatHistory } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Tuliskan pertanyaan konsep yang ingin kamu tanyakan!" });
    }

    const ai = getAIAgent();

    // Map existing chat configuration
    const systemInstruction = `Kamu adalah kak AI Tutor asyik (seperti Dosen Muda atau Kakak Kelas Olimpiade kece yang sangat asyik, gaul, sabar, tapi jenius luar biasa).
Tugasmu adalah menjelaskan topik/pertanyaan kesulitan mahasiswa dengan ANALOGI ANAK SMA (ELI5 versi remaja Indonesia).

ATURAN UTAMA:
1. Gunakan bahasa gaul/santai yang bersahabat, energetik, menggunakan analogi pop-culture (seperti filter TikTok, game Mobile Legends, takdir cinta, boba chatime, bayangin kumpul sama sirkel lo, dsb) atau visualisasi nyata sehari-hari.
2. Hindari kalimat bertele-tele dan jargon akademis kaku tanpa penjelasan analogi. Sebut mereka "sob", "brosis", "kamu", atau "loopers".
3. Di akhir jawaban, berikan satu kalimat motivasi belajar kreatif yang bikin senyum.
4. JIKA mahasiswa memohon kamu langsung mengerjakan PR/soal secara utuh (mencontek total tanpa berpikir), KAMU TIDAK BOLEH MEMBERIKAN JAWABAN JADI! Bimbing mereka lewat teknik scaffolding: Berikan rumus dasarnya, jalankan satu langkah contoh terkecil, kemudian berikan pertanyaan penuntun agar mereka melanjutkannya sendiri.
5. JIKA mahasiswa memberikan input melenceng jauh dari pelajaran (misalnya gosip artis, politik ekstrem, curhat asmara gak berbobot), belokkan kembali dengan super asyik: "Wah gosip/topik itu seru juga sih buat dibahas pas mabar ntar! Tapi demi masa depan cerah brosis, yuk kita amanin dulu bab belajar ini biar ujiannya gampang. Mau kita lanjut bahas bagian mana?"`;

    const instructionsPrompt = `Materi dasar pendukung:
${content || "Gunakan basis pengetahuan umum akademik jika materi kosong."}

Kueri/Kesulitan Mahasiswa saat ini: "${query}"

Berikan penjelasan paling asyik, terangkum dengan analogi remaja SMA Indonesia sekarang!`;

    // Supporting simple multi-turn chat by integrating chatHistory
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: instructionsPrompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85
      }
    });

    res.json({ result: response.text || "Kakak Tutor lagi merenung sob, coba tanya lagi ya!" });
  } catch (err: any) {
    console.error("Error at /api/tutor:", err);
    res.status(500).json({ error: err.message || "Aduh, server AI Tutor lagi gabut nih. Coba lagi brosis!" });
  }
});

// 4. AI LEARNING ROADMAP ENDPOINT
app.post("/api/roadmap", async (req, res) => {
  try {
    const { content, targetTopic } = req.body;
    if (!targetTopic || targetTopic.trim().length === 0) {
      return res.status(400).json({ error: "Masukkan nama materi atau skill target untuk Roadmap!" });
    }

    const ai = getAIAgent();

    const prompt = `Buatlah rencana belajar interaktif yang terstruktur (Learning Roadmap) untuk mendalami topik ini: "${targetTopic}".
Berpatokan pada basis penjelasan materi pendukung ini jika melampirkannya:
"${content || "Topik umum akademik"}"

Struktur Roadmap harus berdurasi pendek dan realistis (misalnya 4 Tahap Pembelajaran terarah atau Program 7 Hari) yang ditulis dalam Bahasa Indonesia.
Formulasi Roadmap HARUS berisi:
1. Tahapan belajar (misal Tahap 1, Tahap 2, dst) beserta estimasi waktu porsi belajarnya.
2. Target Output Pembelajaran dari setiap tahapan (apa yang bisa didemonstrasikan mahasiswa setelah tamat tahap itu).
3. Rekomendasi metode belajar praktis (misal Teknik Feynman: 'jelaskan ke paman imajiner yang tidak mengerti', Teknik Pomodoro untuk membagi porsi membaca, atau Spaced Repetition untuk flashcard kuis).

Buat format Markdown yang sangat visual, indah, dipenuhi emoji pembatas bab yang relevan, penggunaan tabel jika membantu, and tebalkan (bolding) poin-poin paling menentukan/krusial.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.75
      }
    });

    res.json({ result: response.text || "Roadmap gagal dibuat." });
  } catch (err: any) {
    console.error("Error at /api/roadmap:", err);
    res.status(500).json({ error: err.message || "Gagal membangun Learning Roadmap." });
  }
});


async function bootstrap() {
  // Vit-specific middleware setup for dev and static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 and 0.0.0.0 for container ingress
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Study Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
