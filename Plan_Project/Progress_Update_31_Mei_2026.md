# Laporan Progress Harian EduConnect
**Tanggal**: 31 Mei 2026 / 1 Juni 2026

## Ringkasan Pekerjaan Hari Ini
Hari ini telah dilakukan serangkaian perombakan pada fitur utama dan implementasi *security* (manajemen akses akun pengguna). Seluruh pekerjaan dibagi menjadi beberapa fase yang diselesaikan dengan sukses.

### Fase 1: Perombakan Fitur Guru & Jurnal Harian
- **Jurnal Harian**: Menghapus fitur-fitur yang tidak diperlukan pada halaman jurnal untuk menyederhanakan *workflow* semua guru sesuai dengan hasil evaluasi UI/UX.
- **Implementasi Fitur Guru Tahap 2**: Menyempurnakan integrasi modul dan akses guru terhadap kelas-kelas yang diajar, memastikan relasi dan otorisasi (*role*) berjalan dengan akurat.

### Fase 2: Penyesuaian UI & Layout Halaman Dashboard
- **Manajemen Kelas (`ClassroomManagement.jsx`)**: Mengubah logika pengurutan (Sorting) daftar kelas agar diurutkan secara **Ascending** (Mulai dari Kelas 1A, 2A, dsb.) untuk mempermudah navigasi.
- **Dashboard Tata Usaha / Kepala Sekolah (`Home.jsx`)**:
  - Menghapus grafik *Evaluasi Siswa* dan blok *Tugas Aktif* yang sudah tidak digunakan.
  - Mengubah penamaan label untuk mengakomodasi pengelolaan administrasi sarpras dan siswa: 
    - "Total Tugas" diubah menjadi **"Pengajuan Dari Guru"**
    - "Tugas Selesai" diubah menjadi **"Pengajuan Selesai"**
    - "Menunggu" diubah menjadi **"Pengajuan dalam proses"**

### Fase 3: Sistem Lupa Password & Fitur Keamanan (Full-Stack)
- **Database & Backend**:
  - Memastikan validasi kolom `email` pada tabel `User`.
  - Menambahkan integrasi dependency `spring-boot-starter-mail`.
  - Menyusun konfigurasi layanan **SMTP Asli (Gmail App Password)** di dalam `application.yml` untuk pengiriman email yang *production-ready*.
- **Layanan OTP & Email**:
  - Membuat `OtpService` berbasis **Redis** untuk *caching* OTP 6-digit (Masa aktif: 5 menit).
  - Membuat `EmailService` untuk pengiriman email notifikasi kode rahasia langsung ke alamat email *user*.
- **API Endpoints (`AuthController.java`)**:
  - `POST /api/auth/forgot-password`: Menerima dan memvalidasi kecocokan data pengguna (Email, NIP, Username) sebelum mengirimkan OTP.
  - `POST /api/auth/verify-otp`: Memvalidasi kode OTP yang diinputkan pengguna.
  - `POST /api/auth/reset-password`: Mengganti password baru ke dalam *database* (melalui enkripsi `PasswordEncoder`).
- **UI Frontend Terintegrasi**:
  - **Login Page (`Login.jsx`)**: Menambahkan fitur *toggle visibility* (Ikon Mata) agar pengguna dapat melihat password yang sedang diketik, serta menambahkan link navigasi ke halaman lupa password.
  - **Forgot Password Page (`ForgotPassword.jsx`)**: Merancang formulir pemulihan interaktif 3 tahap (Form Permintaan ➔ Form OTP ➔ Form Reset) yang responsif dengan *error handling* yang rapi.

## Kesimpulan
Pembaruan hari ini secara signifikan meningkatkan keamanan akun pengguna melalui sistem verifikasi OTP yang *reliable* dan meningkatkan kenyamanan navigasi (*User Experience*) pada halaman Dashboard serta Manajemen Kelas.

---
*Status: Selesai | Tahap implementasi siap untuk diuji lebih lanjut (Testing).*
