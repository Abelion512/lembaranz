# Audit UI/UX Side-by-Side: Legacy vs. Migration

This audit compares the legacy Lembaran (`arsip_legacy`) with the current Migration project by acting as a QA/User.

---

## 1. Arsitektur & Navigasi

| Fitur | Legacy (Reference) | Migration (Current) | Temuan QA |
| :--- | :--- | :--- | :--- |
| **Menu Utama** | **Hanya Bottom Nav** di semua resolusi. | **Hanya Bottom Nav** (No Sidebar). | Sidebar telah dihapus total sesuai arahan. Navigasi bawah digunakan untuk konsistensi Mobile & Desktop. |
| **Layout** | **Fixed Width (800px)** tengah layar. Luar area adalah `page-bg`. | **Fluid/Responsive**. | Legacy terasa lebih 'centered' dan fokus seperti aplikasi iOS. |
| **Navigasi Balik** | Menggunakan tombol `<a class="back-link">` manual. | Menggunakan navigasi Next.js. | Animasi transisi antar lembaran di Migration perlu dipoles agar semulus Legacy. |

---

## 2. Peningkatan Visual (Glassmorphism & Font)

| Elemen | Legacy (CSS Audit) | Migration (Current) | Temuan QA |
| :--- | :--- | :--- | :--- |
| **Font Stack** | SF Pro (Apple System Font). | Geist + SF Pro. | ✅ **Tuned** (Letter-spacing -0.015em) |
| **Blur Effect** | `25px` (Light) / `30px` (Dark). | `30px` - `35px`. | ✅ **Updated** (Increased blur & transparency) |
| **Opacity** | `0.7` (Light) / `0.8` (Dark). | `0.65` / `0.75`. | ✅ **Updated** (Frosted glass match) |

---

## 3. Komponen Khusus (Modals & Dropdowns)

| Komponen | Legacy (Reference) | Migration (Current) | Temuan QA |
| :--- | :--- | :--- | :--- |
| **Folder Modal** | Menggunakan `modal-header-ios` dengan tombol 'Simpan' di kanan. | Custom React Modal. | Padding di Migration sudah diperbaiki, tapi tombol 'Batal' di bawah kurang menonjol. |
| **Dropdown** | **Native HTML Select**. | **Custom DropdownIOS (Action Sheet)**. | Migration JAUH lebih baik secara UX (gaya iOS 18), tapi warna birunya perlu disesuaikan dengan aksen CSS variable. |
| **Emoji Picker** | Tombol klik yang memicu hidden input. | **Grid Emoji interaktif** di dalam modal. | Migration menang di fitur ini. Layout grid sudah rapi. |

---

## 4. Gamifikasi (Profil / Jatidiri)

> [!IMPORTANT]
> **Gamification Update**: We have reimplemented the full "Jatidiri" experience.

**Implemented Features:**
1.  ✅ **XP Bar & Percent**: Added `30px` progress bar with percentage.
2.  ✅ **Detailed Stats**: Added Total XP, Tier, Total Notes/Words, and Streak.
3.  ✅ **Badge Grid**: Implemented 4-column badge grid with active states.
4.  ✅ **Layout**: Matched `biodata.html` structure (Header -> Hero -> Stats -> List -> Badges).

---

## Rekomendasi QA (Action Items)

1.  **Navigasi**: ✅ Sidebar telah dihapus. Layout 1-kolom terpusat (max-w-md) digunakan untuk meniru nuansa iOS.
2.  **Jatidiri**: Implementasi ulang XP Bar dan Statistik di `/jatidiri`.
3.  **Glass**: Naikkan `backdrop-filter: blur()` di `globals.css` menjadi `30px`.
4.  **Font**: Sesuaikan `letter-spacing` font Geist agar lebih rapat mendekati SF Pro.
