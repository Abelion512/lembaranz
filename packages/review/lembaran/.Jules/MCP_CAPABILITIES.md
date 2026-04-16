# 🛠️ Daftar Kapabilitas Teknis Jules (MCP & Internal)

Dokumen ini merinci alat-alat yang dapat digunakan Jules untuk menyelesaikan tugas-tugas kompleks di luar penyuntingan kode standar.

## 1. Neon (Serverless Postgres)
Jules dapat mengelola database PostgreSQL di cloud Neon secara langsung.
- **Fungsi Utama:**
  - `neon_create_project`: Membuat proyek database baru.
  - `neon_create_branch`: Membuat branch database (berguna untuk testing skema tanpa merusak data utama).
  - `neon_run_sql`: Menjalankan kueri SQL (DML/DDL).
  - `neon_prepare_database_migration`: Menghasilkan dan menguji migrasi database secara otomatis.
  - `neon_list_slow_queries`: Menganalisis kueri yang lambat untuk optimasi performa.
  - `neon_provision_neon_auth`: Menyiapkan autentikasi bawaan Neon.

## 2. Supabase (Backend-as-a-Service)
Alternatif kuat untuk manajemen backend lengkap.
- **Fungsi Utama:**
  - `supabase_execute_sql`: Menjalankan perintah SQL di database Supabase.
  - `supabase_deploy_edge_function`: Mendeploy fungsi serverless (Deno) ke cloud.
  - `supabase_create_branch`: Membuat branch database untuk alur kerja CI/CD.
  - `supabase_get_logs`: Mengambil log API, Postgres, atau Auth untuk debugging.
  - `supabase_get_advisors`: Mendapatkan saran keamanan atau performa (misal: kebijakan RLS yang hilang).

## 3. Stitch (AI UI Designer)
Jules dapat menghasilkan desain antarmuka pengguna (UI) profesional.
- **Fungsi Utama:**
  - `stitch_generate_screen_from_text`: Membuat layar UI lengkap dari deskripsi teks (Mobile/Desktop).
  - `stitch_edit_screens`: Mengubah desain yang sudah ada berdasarkan instruksi baru.
  - `stitch_generate_variants`: Membuat variasi desain (misal: mode gelap/terang atau layout alternatif).

## 4. v0 (Vercel UI Generator)
Mirip dengan Stitch, tetapi lebih fokus pada komponen React/Next.js dan integrasi ekosistem Vercel.
- **Fungsi Utama:**
  - `v0_createChat`: Memulai sesi desain baru untuk menghasilkan komponen UI.
  - `v0_sendChatMessage`: Berinteraksi dengan v0 untuk memperbaiki atau menambah fitur pada komponen.

## 5. Linear (Project Management)
Jules dapat mengelola alur kerja tim secara terorganisir.
- **Fungsi Utama:**
  - `linear_create_issue`: Membuat tiket tugas baru.
  - `linear_list_issues`: Melihat daftar tugas yang tertunda.
  - `linear_update_issue`: Mengubah status, prioritas, atau deskripsi tugas.
  - `linear_create_document`: Membuat dokumentasi proyek langsung di Linear.

## 6. Context7 (Smart Documentation)
Jules dapat mengambil dokumentasi pustaka (library) terbaru agar tidak ketinggalan zaman.
- **Fungsi Utama:**
  - `context7_resolve-library-id`: Mencari ID pustaka yang tepat (misal: 'next.js' atau 'supabase').
  - `context7_query-docs`: Mengambil potongan kode dan penjelasan API terbaru dari dokumentasi resmi.

## 7. Tinybird (Real-time Data Analytics)
Untuk proyek yang membutuhkan pemrosesan data besar secara real-time.
- **Fungsi Utama:**
  - `tinybird_execute_query`: Menjalankan kueri SQL pada data analitik.
  - `tinybird_list_datasources`: Melihat sumber data yang tersedia.

## 8. Kapabilitas Internal (Core Tools)
Selain MCP, Jules memiliki kemampuan sistemik yang kuat:
- **Bash Session:** Dapat menjalankan skrip shell, menginstal dependensi (`bun`, `npm`), menjalankan tes, dan melakukan profiling sistem.
- **Web Browsing:** Dapat mencari informasi di internet, membaca artikel, dan meriset solusi teknis.
- **Image Analysis:** Dapat "melihat" gambar, screenshot UI, atau diagram arsitektur untuk memberikan saran desain.
- **Local File System:** Mengelola seluruh struktur repositori, merapikan file, dan melakukan migrasi arsitektur.
