# Redesign Fondasi Aplikasi Catatan Aman

Dokumen ini merangkum **hasil pembahasan lengkap** mengenai redesign aplikasi catatan (secure notes) beserta **prompt final untuk Google Stitch** yang sudah diperbaiki. Isinya ditujukan sebagai pegangan desain dan referensi iterasi berikutnya.

---

## 1. Pemahaman Produk Saat Ini

### Core Identity
- Aplikasi catatan **local-first** dengan opsi **cloud sync opsional**.
- Fokus pada **keamanan, privasi, dan kontrol user**.
- UX mengarah ke **premium, minimal, iOS-inspired**.

### Fitur Utama yang Sudah Ada
- Notes & folder
- Integrasi cloud:
  - Supabase (Database, Auth, Sync)
  - Notion (Export / Sync Wiki)
  - Roadmap: Google Drive, GitHub
- Secret notes / credentials vault
- Destructive action dengan konfirmasi kuat (hapus permanen)

### Secret Feature (Credential Vault)
- Menyimpan kredensial (email, password, token)
- Auto-detect service (contoh: Gmail → logo Gmail)
- Reveal sementara (±5 detik)
- Auto-copy saat tap

Penilaian:
- Secara konsep **sangat dibutuhkan user**
- Lebih dekat ke password manager ringan dibanding notes biasa
- Nilai jual tinggi jika dieksekusi dengan disiplin UX dan security

---

## 2. Masalah Utama Desain Saat Ini

Masalah bukan di layout atau warna, tapi di **rasa (feel)**.

### Diagnosis
- Terlalu banyak visual intention
- Terlalu banyak efek dekoratif
- Terlalu "web-premium" dan belum benar-benar iOS-native

### Gejala
- Hover-based interaction
- Scale animation
- Ambient glow
- Shadow tebal
- Icon generik

Semua ini membuat UI terlihat "cantik", tapi **terlihat berusaha**.

---

## 3. Prinsip iOS yang Harus Dipatuhi

### 3.1 Interaksi
- Tidak ada hover language
- Feedback hanya:
  - Opacity change
  - Subtle press state
- Tidak ada scale, bounce, atau glow berlebihan

### 3.2 Visual Depth
- Depth dari layering, bukan cahaya
- Blur dingin, low saturation
- Shadow hampir tidak terlihat

### 3.3 Iconografi
- Hindari Material Icons
- Gunakan gaya SF Symbols:
  - Stroke tipis
  - Rounded
  - Konsisten

### 3.4 Typography
- Font system-first
- Tidak agresif
- Tidak decorative
- Membosankan dengan sengaja

---

## 4. Patch UX untuk Fitur Sensitif

### Credential Vault

Yang dipertahankan:
- Auto logo detection
- Auto copy
- Reveal terbatas waktu

Yang diperbaiki:
- Hilangkan teks eksplisit "5s"
- Ganti dengan icon mata + subtle label
- Countdown implisit, bukan angka
- Setelah timeout: auto blur + haptic

Tambahan out-of-the-box (opsional):
- **Context-aware reveal**
  - Jika app backgrounded → auto-hide
- **One-hand safe mode**
  - Reveal hanya saat finger press (hold-to-view)

---

## 5. App Flow yang Direkomendasikan

### High-Level Flow
1. Launch
2. Home (Notes / Folders)
3. Quick Add (+)
   - Note
   - Secret / Credential
4. Detail Note
5. Settings
   - Integrasi
   - Security
   - Data control

### Integrasi Flow
- Default: Local only
- User explicitly enable sync
- Per-integration toggle
- Status jelas: Connected / Disconnected

### Destructive Flow
- Soft warning → hard confirmation
- Copywriting tegas, tanpa drama

---

## 6. Prinsip Desain untuk Stitch

Gunakan prinsip ini saat generate UI:
- Reduce effects by 30–50%
- No hover language
- No glow
- Blur > shadow
- White space lebih penting dari dekorasi

---

## 7. Prompt Final untuk Google Stitch
### 🔹 Google Stitch Prompt (Final)

Design a secure notes mobile application with an iOS-native look and feel.

Design principles:
- Minimal, calm, and understated
- Inspired by iOS system apps (Settings, Notes, iCloud)
- No hover interactions, no scale animations, no glow effects
- Interaction feedback uses opacity change only

Visual style:
- Frosted glass cards with subtle blur
- Cool, low-saturation backgrounds
- Very soft or no shadows
- Thin separators instead of heavy borders
- Clean white space

Typography:
- System-first typography (SF Pro–like)
- Medium and regular weights only
- Clear hierarchy without decorative styles

Iconography:
- iOS-style icons similar to SF Symbols
- Thin stroke, rounded, consistent
- Avoid Material or generic icon styles

Screens to design:
1. Integration Settings screen
   - List of services: Supabase, Notion, Google Drive (coming soon), GitHub (coming soon)
   - Each service shown as a clean card with icon, name, short description, and connection state
   - Toggle or status indicator for connected/disconnected

2. Destructive Action Confirmation modal
   - For permanent data deletion
   - Calm but serious tone
   - No dramatic animations
   - Clear primary action and secondary cancel

3. Credential / Secret Item UI
   - Secure item card with detected service logo (example: Gmail)
   - Hidden by default
   - Reveal on tap or press-and-hold
   - Auto-hide after a short time
   - Auto-copy on interaction
   - No visible countdown numbers

Overall feeling:
- Native iOS app, not a web app
- Quiet, confident, and trustworthy
- Premium through restraint, not decoration

---

## 8. Penutup

Redesign ini bukan soal menambah fitur atau efek, tapi **menghapus hal yang tidak perlu**.

Aplikasi ini sudah punya arah yang benar:
- Security-first
- User control
- Calm UX

Yang dibutuhkan sekarang hanya disiplin dan konsistensi.

Dokumen ini bisa dijadikan baseline untuk iterasi desain berikutnya.

