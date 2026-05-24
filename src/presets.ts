export interface PresetMaterial {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const PRESET_MATERIALS: PresetMaterial[] = [
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
Pasar akan mencapai kondisi keseimbangan jika kuantitas barang yang diminta oleh pembeli sama persis dengan kuantitas yang ditawarkan oleh produsen pada tingkat harga tertentu. Titik temu antara kurva permintaan and kurva penawaran inilah yang melahirkan Harga Keseimbangan Pasar. Jika harga berada di atas ekuilibrium, terjadi surplus barang (kelebihan stok). Sebaliknya, jika harga di bawah ekuilibrium akan menyebabkan kelangkaan barang (shortage).`
  }
];
