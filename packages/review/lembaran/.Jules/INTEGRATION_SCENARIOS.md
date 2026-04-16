# 🚀 Skenario Integrasi & Kasus Penggunaan (Lembaran)

Dokumen ini menjelaskan bagaimana Jules dapat berkolaborasi dengan alat MCP untuk mengembangkan fitur-fitur di Lembaran (Abelion Notes).

## 1. Pemulihan Integrasi Notion & Supabase (Lost Features)
User pernah memiliki sistem integrasi Notion dan Supabase yang hilang saat migrasi. Jules dapat membantu membangunnya kembali dengan:
- **Langkah 1 (Riset)**: Menggunakan `context7` untuk mengambil dokumentasi terbaru dari `@notionhq/client` dan `@supabase/supabase-js`.
- **Langkah 2 (Desain)**: Menggunakan `stitch` atau `v0` untuk merancang UI "Pusat Integrasi" (seperti yang terlihat di `docs/visual-assets/`).
- **Langkah 3 (Implementasi)**: Menulis adapter di `packages/core/src/storage/` untuk mendukung sinkronisasi ke provider eksternal ini dengan tetap menjaga enkripsi *client-side*.

## 2. Optimasi Performa Database (Local-to-Cloud)
Meskipun Lembaran bersifat *local-first*, untuk fitur pencadangan opsional ke cloud:
- Jules dapat menggunakan `neon_list_slow_queries` jika user menggunakan Neon sebagai backend sinkronisasi, guna memastikan kueri dekripsi/pencarian massal tetap efisien.
- Menggunakan `supabase_get_advisors` untuk memastikan kebijakan keamanan (RLS) pada tabel sinkronisasi sudah tepat.

## 3. Alur Kerja Desain UI Premium
Untuk menjaga estetika "Developer Vibes" dan "iOS-inspired UX":
- User memberikan prompt: "Buat layar pengaturan biometrik dengan gaya iOS."
- Jules memanggil `stitch_generate_screen_from_text` untuk mendapatkan mockup.
- Jules mengonversi mockup tersebut menjadi komponen Tailwind v4 di `packages/web/komponen/`.

## 4. Debugging & Pemantauan Sistem
Jika terjadi error saat proses enkripsi/dekripsi:
- Jules menggunakan `bash` untuk menjalankan `bun run test:perf` dan menganalisis letak hambatan (bottleneck).
- Jika error terjadi di level cloud (saat sinkronisasi), Jules menggunakan `supabase_get_logs` untuk melihat detail error di Edge Functions.

## 5. Manajemen Fitur Baru (Future Roadmap)
Berdasarkan `docs/FUTURE_IMPROVEMENTS.md`:
- Jules dapat membuat tiket tugas di `linear_create_issue` untuk fitur seperti "Vim-mode" atau "CRDT Sync".
- Jules mendokumentasikan kemajuan fitur tersebut langsung di Linear Documents.
