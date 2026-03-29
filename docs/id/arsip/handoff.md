# Lembaran: AI Handoff Document 🚀

Dokumen ini disiapkan untuk asisten AI berikutnya agar dapat melanjutkan pengembangan Lembaran (Migrasi/Redesign) tanpa kehilangan konteks.

## 🏗️ Core Architecture (FSD)
Proyek menggunakan **Next.js 15 (App Router)** dengan struktur **Feature-Sliced Design (FSD)**:
- `src/app`: Routing "Lembaran".
- `src/components/features`: Logika UI spesifik (Editor, Vault, Profile).
- `src/lib/storage`: Jantung data (IndexedDB + Web Crypto).
- `src/lib/hooks`: Manajemen state (Zustand) dan logic hooks.

## 🔒 Security & Vault (Brankas Engine)
Fitur paling kritikal adalah **Secure Vault**:
- **Enkripsi**: AES-GCM 256-bit (Sisi klien).
- **Auth**: Kunci diturunkan dari password melalui **PBKDF2**.
- **Validator**: Sistem tidak menyimpan password. Saat setup, sebuah string `"LEMBARAN_SECURED"` dienkripsi dan disimpan di `meta` store. Unlock berhasil jika string ini bisa didekripsi dengan benar.
- **Auto-CRUD**: `VaultRepository.ts` menangani enkripsi/dekripsi otomatis saat proses Save/Get.

## ✍️ Notion-like Editor
- **Tiptap v2**: Menggunakan `@tiptap/suggestion` untuk Slash Commands.
- **Slash Menu (`/`)**: Navigasi keyboard penuh (Up/Down/Enter) untuk blok Headings, Lists, Code, dan Deep Research.
- **Menus**: Bubble Menu (teks format) dan Floating Menu (baris kosong).

## ✅ Current Status (Done)
- [x] Foundation (Next.js, Tailwind v4, IDB Setup).
- [x] Secure Vault UI & Logic (Challenge-Response).
- [x] Rich Text Editor dengan Slash Commands & Notion Feel.
- [x] Dynamic Profile Stats (Real count from IDB).
- [x] Layout iOS-Native (Glassmorphism, Bottom Nav).

## 🚀 Next Steps (Priority)
AI berikutnya harus fokus pada penyelesaian **Advanced Logic**:
1. **Functional Search**: Implementasi pencarian di `/cari`. Memerlukan pengambilan semua catatan dari `VaultRepository`, dekripsi di memori, dan filtering client-side.
2. **Real Activity Charts**: Hubungkan grafik di `/jatidiri` dengan `updatedAt` dari catatan asli.
3. **Folders & Tags**: Implementasi navigasi folder dan filtering berbasis tag.
4. **Supabase Sync**: Mengaktifkan `SyncEngine` untuk backup cloud (opsional).

## 📂 Key Files
- `src/lib/storage/VaultRepository.ts` -> Logika utama data terenkripsi.
- `src/lib/storage/brankas.ts` -> Primitif kriptografi.
- `src/components/features/editor/SlashCommand.tsx` -> Konfigurasi menu `/`.
- `src/components/features/vault/VaultLockScreen.tsx` -> Logika Lock & Setup.

---
**Status Terakhir**: Semua kode sudah di-push ke branch `main`. Build status: **SUKSES**.
