# Rencana Penerapan Fitur Guru Tahap 2

Dokumen ini berisi analisis dan rencana aksi (*rundown*) untuk pengembangan dan penerapan Fitur Guru Tahap 2 pada sistem EduConnect, sesuai dengan spesifikasi yang diberikan.

---

## A. Analisis Kebutuhan & Perubahan Sistem

### 1. Manajemen Tipe User Guru & Relasi Kelas
- **Dua Tipe Guru:** Sistem perlu membedakan user guru menjadi dua kategori: `Guru Kelas` dan `Guru Khusus` (Agama, Kesenian, Olahraga).
- **Relasi Guru Kelas (One-to-One):** Seorang Guru Kelas hanya akan terikat pada satu Kelas tertentu (misal: Guru Kelas 1A). Di tingkat database, ini bisa dicapai dengan Foreign Key unik pada tabel `Kelas` yang mengarah ke `Guru`, atau sebaliknya.
- **Relasi Guru Khusus (One-to-Many):** Seorang Guru Khusus mengajar di banyak kelas. Diperlukan tabel *join/mapping* khusus yang mendata daftar kelas mana saja yang diajar oleh guru khusus tersebut.

### 2. Fitur Jadwal Kelas (Persiapan)
- Meskipun fitur Jadwal Kelas saat ini masih tertutup (belum rilis penuh), backend dan UI perlu disiapkan agar tiap guru (Kelas & Khusus) memiliki keleluasaan dalam membuat dan memodifikasi jadwal mengajar mereka sendiri secara dinamis.

### 3. Perombakan Fitur Penilaian Siswa
- **Otorisasi Ketat:** Hak akses memodifikasi (CRUD) nilai siswa harus dibatasi hanya untuk `Guru Kelas` (hanya di kelasnya sendiri) dan `Guru Khusus` (di kelas-kelas yang menjadi tanggung jawabnya).
- **Penyesuaian Mata Pelajaran (Guru Kelas):** Disediakan 7 mata pelajaran wajib untuk Guru Kelas, yaitu: Bahasa Indonesia, Bahasa Inggris, Bahasa Daerah, Matematika, PKN, IPS, dan IPA.
- **Navigasi Guru Khusus:** UI Penilaian untuk Guru Khusus harus menyediakan komponen *dropdown* filter kelas (Kelas 1 s/d Kelas 6) agar mereka dapat menginput nilai secara spesifik untuk masing-masing kelas.
- **Integrasi Nilai Raport:** Sistem penilaian harus saling terintegrasi. Ketika Guru Khusus menginput dan menyimpan nilai siswa (misal nilai Agama/Kesenian/Olahraga), nilai tersebut akan langsung muncul dan terekap di halaman penilaian Guru Kelas secara otomatis. Hal ini mengeliminasi kebutuhan manual (seperti saling berkirim pesan) untuk merekap nilai ke dalam raport.
- **Logika Konversi Sikap:** Pada tabel Penilaian, kolom yang tadinya bernama "Mata Pelajaran" diganti menjadi "Sikap Siswa" dengan aturan konversi angka ke teks:
  - `1.0 - 1.99` = Kurang
  - `2.0 - 2.99` = Cukup
  - `3.0 - 3.99` = Baik
  - `4.0 - 5.0` = Sangat Baik

### 4. Fitur Raport & Kalkulasi Nilai Akademik
- **Skala Penilaian:** Fitur penilaian akademik menggunakan skala 0 - 100. (Berbeda dengan penilaian "Sikap Siswa" yang memiliki logikanya sendiri).
- **Komponen Nilai & Logika:**
  - **Nilai Tugas:** Dihitung dari rata-rata seluruh tugas (Total Nilai Tugas / Jumlah Tugas). Contoh: 785 / 10 = 78.5.
  - **Nilai Ulangan:** Dihitung dari rata-rata seluruh ulangan (Total Nilai Ulangan / Jumlah Ulangan).
  - **Nilai UTS & UAS:** Merupakan *single input* (satu kali pengambilan nilai), tanpa logika rata-rata.
  - **Nilai Akhir & Raport:** Nilai Akhir = (Nilai Tugas + Nilai Ulangan + Nilai UTS + Nilai UAS). Nilai Raport = Nilai Akhir / 4. Berlaku untuk setiap mata pelajaran.
- **Halaman Raport (Khusus Guru Kelas):** Sebuah fitur rekapitulasi yang menarik semua nilai (Tugas, Ulangan, UTS, UAS, Raport) dari seluruh mata pelajaran (termasuk mapel dari Guru Khusus).
- **Ranking Kelas:** Sistem perankingan otomatis. Siswa dengan nilai tertinggi mendapat Ranking 1. Logika penentuan (*Nilai Ranking*): (Jumlah Total Nilai Raport Semua Mapel / Total Mapel).
- **Cetak Raport:** Disediakan tombol *Preview* yang akan menampilkan format cetak (PDF/Print) dari Raport siswa.

### 5. Fitur Sarana Prasarana (SarPras)
- Perlu ditambahkan modul "Pengaduan SarPras" yang ditujukan kepada pihak Tata Usaha (TU). Fitur ini berupa form pelaporan kerusakan atau permintaan fasilitas.

### 6. Perombakan Dashboard Guru
Berdasarkan referensi gambar, komponen UI di halaman Home/Dashboard guru perlu dirombak secara total:
- **Card Kiri (Merah):** Diubah menjadi informasi/tombol "Pengajuan Ke Kepala Sekolah" (mencakup: Meminta izin, perbaikan kelas, acc dokumen, surat instansi).
- **Card Tengah (Kuning):** Diubah menjadi counter "Pengajuan yang telah diterima".
- **Card Kanan (Hijau):** Diubah menjadi counter "Pengajuan Masih dalam Proses".
- **Area Chart (Putih):** Diubah menjadi "Grafik Nilai Kelas". Chart ini wajib menggunakan integrasi API riil ke *database* untuk menampilkan 3 metrik per periode: Nilai Terbaik, Nilai Rata-rata, dan Nilai Terendah.
- **Area Tabel Bawah (Hitam):** Diubah fungsionalitasnya menjadi "Jurnal Harian" yang merangkum log aktivitas atau jurnal kegiatan guru pada hari tersebut.

---

## B. Plan Rundown Implementasi (Tahapan Pengerjaan)

### Tahap 1: Database & Backend (Data Layer)
1. **Migrasi Entitas Guru:**
   - Tambahkan field `tipe_guru` (Enum: `KELAS`, `KHUSUS`) pada tabel user/teacher.
   - Buat relasi *One-to-One* antara `Guru` dan `Kelas` untuk tipe Guru Kelas.
   - Buat tabel perantara (misal: `guru_kelas_mapping`) untuk relasi *One-to-Many* bagi Guru Khusus.
2. **Master Data Mata Pelajaran:** 
   - Seed data mapel wajib untuk Guru Kelas (Bhs Indonesia, Bhs Inggris, Bhs Daerah, dsb.).
3. **Logika Penilaian, Raport, & Otorisasi API:** 
   - Buat fungsi utilitas di backend untuk menghitung kategori "Sikap Siswa" dari nilai *float* (1.0 - 5.0).
   - **Logika Nilai Akademik:** Buat *service* penghitungan otomatis untuk Nilai Tugas (rata-rata), Nilai Ulangan (rata-rata), Nilai Akhir (sum), dan Nilai Raport (Nilai Akhir / 4) dalam skala 0-100.
   - **Logika Ranking:** Buat API/Service untuk menghitung agregasi *Nilai Ranking* tiap siswa dan mengurutkannya secara *descending* untuk menentukan ranking 1 hingga terakhir.
   - Terapkan *Role-Based Access Control* (RBAC) pada API Penilaian agar validasi relasi kelas dan guru berjalan (hanya guru terkait yang bisa akses POST/PUT nilai).
   - Rancang arsitektur relasional pada *database* nilai agar record nilai terhubung secara global pada entitas `Siswa`. Dengan demikian, *query* "Get Nilai Raport Siswa" dari sisi Guru Kelas akan secara dinamis menyertakan nilai terbaru yang diinputkan oleh Guru Khusus tanpa perlu sinkronisasi manual.
4. **API Sarpras:** 
   - Buat *endpoint* baru untuk CRUD form Pengaduan SarPras ke TU.
5. **API Dashboard:** 
   - Buat *endpoint* untuk menarik rekap status pengajuan (Proses & Diterima).
   - Buat *endpoint* agregasi untuk "Grafik Nilai Kelas" yang mengembalikan nilai max, rata-rata, dan min berdasar kelas.

### Tahap 2: Frontend (UI/UX Layer - Dashboard)
1. **Refactor Halaman Dashboard (`Home.jsx`):**
   - Rombak *Card Summary* menjadi: Pengajuan ke Kepsek, Diterima, dan Diproses.
   - Tambahkan modal/form baru saat tombol "Pengajuan ke Kepsek" diklik (opsi: izin, perbaikan, dll).
2. **Integrasi Grafik Riil:**
   - Ubah komponen chart dari data *mock* menjadi pemanggilan *fetch* ke API aggregasi nilai. Tampilkan bar/line chart untuk Nilai Terbaik, Rata-rata, dan Terendah.
3. **Tabel Jurnal Harian:**
   - Rombak tabel bagian bawah (Tugas Aktif) menjadi tabel "Jurnal Harian". Sesuaikan kolom tabel dengan kebutuhan entri jurnal guru.

### Tahap 3: Frontend (UI/UX Layer - Penilaian, Raport, & SarPras)
1. **Halaman Penilaian Siswa:**
   - **Kolom Penilaian Akademik:** Sediakan input nilai skala 0-100 untuk Tugas (bisa diinput akumulasinya), Ulangan, UTS, dan UAS.
   - **Penilaian Sikap:** Sediakan kolom "Sikap Siswa" terpisah dan terapkan fungsi *formatting* untuk menampilkan *badge/text* (Sangat Baik, Baik, Cukup, Kurang) sesuai skor.
   - Buat fitur kondisional UI: Jika *logged in user* = Guru Khusus, tampilkan komponen *Dropdown* Pilih Kelas (Kelas 1 - 6) sebelum memuat tabel siswa.
   - Sembunyikan tombol edit/save jika user tidak memiliki relasi terhadap kelas (validasi read-only).
2. **Halaman Raport (Khusus Guru Kelas):**
   - Buat sub-menu/halaman baru "Raport" untuk melihat agregasi nilai (Tugas, Ulangan, UTS, UAS, dan Nilai Raport) dari seluruh mapel.
   - Tampilkan informasi **Ranking Kelas** siswa.
   - Sediakan tombol aksi **Preview Raport** untuk membuka format UI yang dioptimasi untuk proses *print* (Cetak Dokumen).
3. **Halaman Sarana Prasarana:**
   - Buat sub-menu/form baru untuk "Pengaduan SarPras ke TU" dengan isian deskripsi aduan dan bukti foto (opsional).

### Tahap 4: Testing & UAT
1. Login sebagai `Guru Kelas`, pastikan: hanya bisa melihat 1 kelas, form penilaian muncul 7 mapel wajib, chart mengambil data kelas sendiri, dan bisa membuat pengaduan Sarpras.
2. Login sebagai `Guru Khusus`, pastikan: terdapat dropdown pilihan kelas 1-6, bisa berpindah antarkelas, bisa melihat dan mengisi penilaian.
3. Lakukan verifikasi kalkulasi *Sikap Siswa* memastikan parameter angka berjalan sesuai logika.
4. Lakukan verifikasi tampilan UI *Dashboard* memastikan form pengajuan Kepala Sekolah bekerja.

---
**Catatan:** Untuk fitur "Jadwal Kelas", UI dan API secara perlahan mulai dibangun sebagai struktur terpisah (modular), dengan *toggle switch* (feature flag) agar tetap tertutup sementara dari akses user production hingga siap rilis.
