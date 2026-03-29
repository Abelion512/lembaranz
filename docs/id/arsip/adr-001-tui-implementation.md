# ADR-001: Implementasi Terminal User Interface (TUI)

## Status
Accepted

## Context
Aplikasi Lembaran ditujukan untuk developer dan power user yang sering bekerja di lingkungan terminal. Meskipun antarmuka web (GUI) sudah tersedia, dibutuhkan cara yang lebih cepat untuk melakukan pemeliharaan data dan pengecekan sistem tanpa harus membuka browser.

## Decision
Kami memutuskan untuk mengimplementasikan antarmuka visual terminal (TUI) menggunakan library `prompts` dan `picocolors`. TUI ini akan diintegrasikan ke dalam binary `bin/lembaran` yang sudah ada.

## Consequences
- **Efisiensi**: Developer dapat mengelola arsip dengan navigasi keyboard yang sangat cepat.
- **Konsistensi**: Logika keamanan tetap terpusat di folder `src/aksara`, namun kini dapat dipanggil melalui terminal.
- **Dependensi**: Menambahkan library `commander`, `prompts`, dan `picocolors` sebagai dependensi inti CLI.
