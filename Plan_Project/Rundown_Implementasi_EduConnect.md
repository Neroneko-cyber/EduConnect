# Rundown Implementasi Proyek EduConnect
**Berdasarkan Master Blueprint EduConnect**

Dokumen ini memuat jadwal dan tahapan implementasi teknis untuk membangun Sistem Informasi Manajemen Operasional Sekolah (SIMOS) EduConnect.

---

## Fase 1: Persiapan & Setup Lingkungan (Minggu 1)
- [x] **1.1 Setup Database:** Instalasi Microsoft SQL Server lokal. Pembuatan database `EduConnectDB` dan konfigurasi user (`sa`).
- [x] **1.2 Setup Backend:** Inisialisasi proyek Java 21 dengan Spring Boot 3.2.x. Konfigurasi koneksi HikariCP ke SQL Server dan penambahan dependensi inti (Spring Web, Spring Data JPA).
- [x] **1.3 Setup Frontend:** Inisialisasi proyek React 18/19 dengan Vite. Konfigurasi routing dasar dan penyiapan sistem desain (kontras tinggi, *fat-finger friendly*).
- [x] **1.4 Setup Document Engine:** Instalasi *library* pemrosesan dokumen di Java (`OpenPDF` untuk PDF, `Apache POI` untuk Excel/Word/PPT).
- [x] **1.5 Setup Konfigurasi Standar:** Implementasi Global Exception Handler, konfigurasi CORS, dan integrasi Swagger/OpenAPI untuk dokumentasi REST API.

---

## Fase 2: Autentikasi & Master Data Core (Minggu 2)
- [x] **2.1 Pemodelan DB Utama:** Pembuatan entitas JPA untuk `users` (termasuk Role) dan `classrooms`.
- [x] **2.2 Modul Keamanan:** Implementasi Spring Security menggunakan JWT Stateless Authentication & BCrypt Password Hashing. Penyediaan endpoint otentikasi (Login).
- [x] **2.3 API CRUD Master Data:** Penyediaan REST API untuk manajemen pengguna (Kepala Sekolah, Wakasek, Guru, TU, Siswa) dan pembagian kelas.
- `[x]` **2.4 Frontend Dashboard:** Pembuatan halaman Login dan layout UI Dashboard dasar yang bisa beradaptasi dengan *role* pengguna yang masuk.

---

## Fase 3: Modul Disposisi & Komunikasi (Minggu 3)
- [x] **3.1 Pemodelan DB Komunikasi:** Pembuatan entitas `dispositions`, `announcements`, dan `read_receipts`.
- [x] **3.2 API Disposisi & Pengumuman:** Pembuatan endpoint REST untuk membuat disposisi (`POST /api/dispositions`), merubah status, mengirim pengumuman, dan mencatat *read-receipt*.
- [x] **3.3 Infrastruktur Real-time:** Setup Spring Websocket + STOMP di backend agar notifikasi disposisi baru langsung masuk ke klien tanpa perlu *refresh*.
- [x] **3.4 UI Komunikasi:** Pembuatan form "Buat Disposisi", tampilan daftar tugas (*To-Do, In-Progress, Done*), dan integrasi ikon lonceng notifikasi.
- [x] **3.5 Fitur Lampiran & Dokumen Dinas:** Implementasi fungsi unggah/unduh lampiran (PDF/Word) pada disposisi, dan integrasi `Apache POI - XWPF` untuk pembuatan Surat Dinas/Tugas otomatis.

---

## Fase 4: Modul Nilai, Akademik & Rapor (Minggu 4 - 5)
- [x] **4.1 Pemodelan DB Akademik:** Pembuatan entitas `daily_journals` dan `student_grades`.
- [x] **4.2 API Nilai:** Endpoint untuk mengambil struktur grid nilai (`GET /api/grades/class/{classId}`) dan auto-save data (`PATCH /api/grades/bulk`).
- [x] **4.3 UI Spreadsheet Nilai:** Implementasi komponen Grid (mis. Handsontable/Ag-Grid) di React. Pemasangan *event onBlur* dengan debounce 500ms agar nilai tersimpan otomatis saat sel ditinggalkan.
- [x] **4.4 Logika Kalkulasi Backend:** Hitung nilai otomatis (30% Harian + 30% UTS + 40% UAS). Pembuatan logika *Locking* nilai jika melewati tenggat waktu (*Read-Only*).
- [x] **4.5 Modul Ekspor Rapor (PDF):** Merancang template rapor K13/Merdeka via `OpenPDF` dan membuat endpoint unduhan Rapor (`GET /api/grades/export/pdf/{studentId}`).
- [~] **4.6 Modul Impor/Ekspor Excel:** Fitur bagi guru untuk unggah nilai massal via format Excel `.xlsx` menggunakan `Apache POI` (`POST /api/grades/import`). *(Dialihkan prioritinya untuk Ekspor Laporan Manajemen)*
- [x] **4.7 Manajemen Jurnal Harian:** Pembuatan API CRUD dan UI bagi guru untuk mencatat kegiatan harian mengajar berdasarkan entitas `daily_journals`.

---

## Fase 5: Modul Sarpras, Inventaris & Tiketing (Minggu 6)
- `[x]` **5.1 Pemodelan DB Sarpras:** Pembuatan entitas `assets` dan `asset_tickets`.
- `[x]` **5.2 Mesin Pencari:** Mengimplementasikan *Sequential Search* (`LIKE %keyword%`) pada backend API untuk mencari aset (`GET /api/assets/search`).
- `[x]` **5.3 Logika Auto-Disposisi:** Otomasi pembuatan Disposisi ke staf TU setiap kali Wali Kelas menekan tombol "Lapor Rusak" pada item aset (`POST /api/tickets`).
- `[x]` **5.4 UI Sarpras & Tiket:** Tampilan *mobile-friendly* daftar aset bagi Wali Kelas untuk pelaporan kerusakan, dan Dasbor Pencarian/Audit untuk Staf TU.
- `[x]` **5.5 Ekspor Laporan Manajemen:** Implementasi unduh rekap data bulanan ke Excel dan ekstraksi statistik ke file `.pptx` (PowerPoint) untuk rapat pleno menggunakan `Apache POI`.

---

## Fase 6: Stabilisasi, UAT & Peluncuran (Minggu 7 - 8)
- [x] **6.1 System Integration Testing (SIT):** Pengujian integrasi end-to-end dari frontend ke backend hingga pembuatan dokumen.
- [x] **6.2 UI/UX Polish:** Memeriksa kembali kontras visual dan ukuran tombol memastikan *accessibility* sesuai visi awal.
- [~] **6.3 User Acceptance Testing (UAT):** Uji coba sistem dengan pimpinan sekolah, guru, dan TU. Penampungan *feedback* serta perbaikan *bug*. *(Siap dieksekusi)*
- [x] **6.4 Produksi & Serah Terima:** Pembuatan *build* React (statik) dan *package* jar Spring Boot. Pelatihan singkat operasional.
- [x] **6.5 Deployment & Infrastruktur:** Pengaturan server/VM, konfigurasi Reverse Proxy (Nginx), Setup SSL (HTTPS), dan *service daemon* (Systemd/Docker) untuk rilis aplikasi ke production.
