# Blueprint Master & Rencana Implementasi: EduConnect
**Sistem Informasi Manajemen Operasional Sekolah (SIMOS)**

Dokumen ini adalah *Master Blueprint* yang membedah arsitektur, spesifikasi teknis, alur bisnis, dan skema database secara komprehensif untuk proyek **EduConnect**, sebuah ekosistem *Digital Workspace* bagi Kepala Sekolah, Guru, dan Staf Tata Usaha (TU).

---

## 1. 📌 Visi & Batasan Sistem (System Boundaries)

**Visi:** Sentralisasi operasional sekolah dari yang sebelumnya terfragmentasi di WhatsApp dan kertas, menjadi satu platform cloud yang mulus, aman, dan dapat diaudit secara real-time.

**Batasan (Blacklist - Yang TIDAK dibangun):**
1. ❌ Integrasi ARKAS (Sistem Anggaran Kemdikbud).
2. ❌ Absensi geofencing radius 10 meter (Menghindari kendala akurasi GPS di desa).
3. ❌ Sistem PPDB Online (Fokus murni pada operasional internal pasca-penerimaan).

---

## 2. 🛠️ Tumpukan Teknologi (Tech Stack) Terperinci

### 2.1 Backend (Java Spring Boot)
*   **Runtime:** Java 21 LTS.
*   **Framework:** Spring Boot 3.2.x.
*   **Komunikasi:** REST API (Spring Web MVC) & WebSockets (Spring Websocket + STOMP) untuk real-time messaging.
*   **Keamanan:** Spring Security, JWT (JSON Web Token) Stateless Authentication, BCrypt Password Hashing.
*   **Akses Data:** Spring Data JPA (Hibernate) + HikariCP Connection Pool.

### 2.2 Mesin Pengolah Dokumen (Export & Import Engine)
Untuk mendukung konsep *Paperless* tanpa menghilangkan kapabilitas cetak resmi:
*   **PDF Engine (`OpenPDF` / `iText`):**
    *   *Penggunaan:* Pembuatan otomatis Rapor Digital (dengan *watermark*), Surat Keputusan (SK) Kepala Sekolah, dan Laporan Final Tiket Kerusakan yang sudah tidak dapat dimodifikasi (read-only).
*   **Excel Engine (`Apache POI - XSSF`):**
    *   *Ekspor:* Rekap absensi bulanan, daftar nilai kumulatif, buku induk sarpras.
    *   *Impor:* Modul khusus bagi guru untuk mengunggah nilai massal dari Excel (.xlsx) langsung ke database tanpa input satu-satu di web.
*   **Word Engine (`Apache POI - XWPF`):**
    *   *Penggunaan:* Pembuatan otomatis *Surat Dinas/Surat Tugas* berformat standar, dan format unduhan Rencana Pelaksanaan Pembelajaran (RPP)/Silabus.
*   **PowerPoint Engine (`Apache POI - XSLF`):**
    *   *Penggunaan:* Ekspor satu-klik untuk "Ringkasan Laporan Bulanan" ke `.pptx` (berisi tabel performa nilai dan statistik kerusakan aset) untuk bahan presentasi rapat pleno.

### 2.3 Frontend (React)
*   **Framework:** React 18 / 19 + Vite.
*   **Desain UX:** Antarmuka responsif, tombol berukuran besar (*fat-finger friendly*), dan kontras tinggi untuk memudahkan guru senior.
*   **Manipulasi Data:** Komponen *Grid Spreadsheet* (misal: Handsontable atau Ag-Grid versi ringan) untuk input nilai, sehingga guru dapat bernavigasi menggunakan tombol panah keyboard layaknya MS Excel.

### 2.4 Database
*   **RDBMS:** Microsoft SQL Server (Jalan di localhost Windows).
*   **Database:** `EduConnectDB`

---

## 3. 🔄 Alur Bisnis & Logika Sistem Lengkap (Business Flows)

Berikut adalah algoritma kerja (*workflow state machine*) dari 3 pilar utama sistem:

### Flow 1: Sistem Disposisi & Komunikasi Terpusat
Menggantikan instruksi WhatsApp dengan sistem yang dapat dilacak (Auditable Task Management).
1.  **[INIT]** Kepala Sekolah masuk ke Dashboard, klik "Buat Disposisi Baru".
2.  **[INPUT]** Mengisi Judul, Deskripsi, Tenggat Waktu (Due Date), dan memilih Assignee (misal: Wakasek Kesiswaan).
3.  **[DISPATCH]** Disposisi dikirim. Sistem menyimpan ke database dengan status `TODO`.
4.  **[REALTIME EVENT]** Backend menembakkan *WebSocket payload* ke klien Wakasek. Ikon lonceng notifikasi Wakasek menyala.
5.  **[ACKNOWLEDGE]** Wakasek mengklik disposisi dan menekan tombol "Mulai Kerjakan". Status berubah dari `TODO` menjadi `IN_PROGRESS`. Log waktu terekam.
6.  **[EXECUTION]** Wakasek menyelesaikan tugas, mengunggah lampiran PDF/Word (jika ada), lalu menekan "Selesai". Status menjadi `DONE`.
7.  **[VERIFICATION]** Kepala Sekolah menerima notifikasi *Done*. Beliau meninjau, jika kurang pas, bisa dikembalikan ke `IN_PROGRESS` beserta catatan revisi.

### Flow 2: Manajemen Nilai & Pembuatan Rapor Otomatis
Mengurangi beban lembur guru di akhir semester.
1.  **[DATA ENTRY]** Guru mapel membuka menu "Daftar Nilai". Tampilan berubah menjadi tabel spreadsheet raksasa.
2.  **[AUTOSAVE LOGIC]** Setiap kali guru mengetik angka dan pindah sel, *event `onBlur`* di frontend akan menembakkan API `PATCH /api/grades` (disertai debounce 500ms agar server tidak kelebihan beban). Tidak ada tombol "Save" manual.
3.  **[AUTO-CALCULATION]** Backend otomatis menghitung: Nilai Akhir = (30% Harian) + (30% UTS) + (40% UAS).
4.  **[LOCKING]** Tepat pada tanggal batas akhir pengisian nilai, sistem mengubah akses seluruh `grades` menjadi *Read-Only*.
5.  **[REPORT GENERATION]** Wali kelas menekan "Cetak Rapor Kelas X-A". Backend mengambil data semua mapel, lalu menggunakan `OpenPDF` untuk me-*render* template PDF Rapor Kurikulum Merdeka/K13 lengkap dengan nilai, huruf mutu, dan catatan otomatis.

### Flow 3: Tiketing Inventaris & Audit Tata Usaha (Sarpras)
Pendelegasian pengawasan aset kepada guru kelas, dan mempermudah audit staf TU.
1.  **[MONITORING]** Wali Kelas mengecek daftar aset (`class_assets`) di kelasnya via HP.
2.  **[REPORTING]** Wali Kelas menemukan kipas angin mati. Ia mengklik "Lapor Rusak" pada item kipas tersebut.
3.  **[TICKETING]** Sistem membuat entitas `ticket_reports` dengan status `OPEN`.
4.  **[AUTO-DISPOSISI]** Sistem secara *background* membuat Disposisi otomatis yang ditugaskan ke Staf TU, berisi tautan tiket tersebut.
5.  **[AUDIT SEARCH (Sequential Search)]** Di akhir bulan, Staf TU membuka dasbor. Staf mencari kode aset "KPS-001" menggunakan *Search Bar*.
    *   *Logika Pencarian:* Backend Java melakukan pencarian berurutan (*Sequential/Linear Search* dengan JPA `LIKE %keyword%`) pada ribuan data.
    *   *Alasan Kinerja:* Dipilih karena staf seringkali menginput data tanpa urutan (*unsorted*), sehingga *Binary/Interpolation search* akan gagal kecuali sistem mengurutkannya terlebih dahulu.
6.  **[EXPORT]** TU menekan "Ekspor Laporan Bulanan". Backend menggunakan `Apache POI` untuk merajut data tiket bulan ini menjadi tabel Excel cantik untuk dicetak dan diserahkan ke bendahara.

---

## 4. 🗄️ Skema Database SQL Server (DDL & Relasi Detail)

Berikut representasi detail tipe data untuk pemetaan JPA (`@Entity`):

### Skema Autentikasi & Organisasi
*   **`users`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `identity_number` (VARCHAR(50), UNIQUE) -> NIP/NISN
    *   `full_name` (VARCHAR(150))
    *   `email` (VARCHAR(100), UNIQUE)
    *   `password_hash` (VARCHAR(255))
    *   `role` (VARCHAR(20)) -> KEPSEK, WAKASEK, GURU, TU_STAFF, SISWA
    *   `created_at` (DATETIME2)

*   **`classrooms`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `name` (VARCHAR(50)) -> "Kelas X IPA 1"
    *   `homeroom_teacher_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `academic_year` (VARCHAR(20))

### Skema Pusat Komunikasi
*   **`dispositions`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `ticket_id` (VARCHAR(50), UNIQUE) -> Misal: "DSP-202605-001"
    *   `title` (VARCHAR(200))
    *   `description` (NVARCHAR(MAX))
    *   `sender_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `assignee_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `status` (VARCHAR(20)) -> TODO, IN_PROGRESS, REVISION, DONE
    *   `due_date` (DATETIME2)
    *   `created_at` (DATETIME2)
    *   `completed_at` (DATETIME2, NULL)

*   **`announcements`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `title` (VARCHAR(200))
    *   `content` (NVARCHAR(MAX))
    *   `author_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `created_at` (DATETIME2)

*   **`read_receipts`** (Tanda Bukti Baca)
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `announcement_id` (UNIQUEIDENTIFIER, FK -> announcements.id)
    *   `user_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `read_at` (DATETIME2)

### Skema Akademik & Evaluasi
*   **`daily_journals`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `teacher_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `classroom_id` (UNIQUEIDENTIFIER, FK -> classrooms.id)
    *   `subject` (VARCHAR(100))
    *   `topic_covered` (NVARCHAR(MAX))
    *   `activity_date` (DATE)

*   **`student_grades`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `student_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `subject` (VARCHAR(100))
    *   `semester` (VARCHAR(20)) -> "Ganjil 2026"
    *   `grade_daily` (DECIMAL(5,2))
    *   `grade_uts` (DECIMAL(5,2))
    *   `grade_uas` (DECIMAL(5,2))
    *   `final_score` (DECIMAL(5,2)) -> Dihitung otomatis oleh backend

### Skema Sarana Prasarana (Inventaris)
*   **`assets`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `asset_code` (VARCHAR(50), UNIQUE)
    *   `name` (VARCHAR(150))
    *   `category` (VARCHAR(50)) -> MEUBEL, ELEKTRONIK, BUKU
    *   `condition` (VARCHAR(20)) -> BAIK, RUSAK_RINGAN, RUSAK_BERAT, HILANG
    *   `location_id` (UNIQUEIDENTIFIER, FK -> classrooms.id / ruangan khusus)
    *   `purchase_year` (INT)
    *   `price` (DECIMAL(15,2))

*   **`asset_tickets`**
    *   `id` (UNIQUEIDENTIFIER, PK)
    *   `asset_id` (UNIQUEIDENTIFIER, FK -> assets.id)
    *   `reporter_id` (UNIQUEIDENTIFIER, FK -> users.id)
    *   `issue_description` (NVARCHAR(MAX))
    *   `status` (VARCHAR(20)) -> OPEN, IN_PROGRESS, RESOLVED
    *   `disposition_id` (UNIQUEIDENTIFIER, NULL, FK -> dispositions.id)
    *   `created_at` (DATETIME2)

---

## 5. 🌐 Rancangan API Endpoints (RESTful)

### Komunikasi & Disposisi
*   `POST /api/dispositions` -> Membuat disposisi baru.
*   `PATCH /api/dispositions/{id}/status` -> Update status (In Progress/Done).
*   `GET /api/announcements` -> Menarik daftar pengumuman.
*   `POST /api/announcements/{id}/read` -> Mencatat read-receipt.

### Akademik & Nilai
*   `GET /api/grades/class/{classId}` -> Menarik data grid nilai (Format JSON Array).
*   `PATCH /api/grades/bulk` -> Auto-save nilai dari spreadsheet frontend.
*   `POST /api/grades/import` -> Mengunggah file `.xlsx` untuk dibaca Apache POI.
*   `GET /api/grades/export/pdf/{studentId}` -> Mengunduh Rapor PDF.

### Aset & Sarpras
*   `GET /api/assets/search?q=keyword` -> Mengeksekusi Sequential Search di DB.
*   `POST /api/tickets` -> Melaporkan kerusakan aset.
*   `GET /api/assets/export/excel` -> Mengunduh rekap inventaris format `.xlsx`.
