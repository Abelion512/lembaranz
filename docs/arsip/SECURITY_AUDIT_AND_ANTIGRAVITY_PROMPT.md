# 🔒 Audit Keamanan & Prompt untuk Antigravity

## 📋 Checklist Keamanan yang Sudah Diimplementasikan

### ✅ **Enkripsi & Key Derivation**
- [x] AES-GCM 256-bit encryption
- [x] Argon2id key derivation (19MB RAM, 2 iterations)
- [x] SHA-256 integrity hashing
- [x] Zero-knowledge architecture
- [x] Master key generation dengan Web Crypto API

### ✅ **Proteksi Brute-Force**
- [x] Memory-hard KDF (Argon2id 19MB RAM)
- [x] Salt unik per vault
- [x] Auto-lock setelah 1 menit idle
- [x] Panic key untuk emergency wipe
- [x] Password tidak pernah disimpan/transmit

### ✅ **Data Integrity**
- [x] Digital seal (SHA-256) per catatan
- [x] Tamper detection
- [x] Metadata exclusion dari hash calculation
- [x] Integrity check sebelum decrypt

### ⚠️ **Area yang Perlu Diperbaiki**

#### 1. **Rate Limiting** ❌
```typescript
// BELUM ADA rate limiting untuk unlock attempts
// Rentan terhadap online brute-force jika ada API endpoint
```

#### 2. **Constant-Time Comparison** ❌
```typescript
// BELUM ADA constant-time comparison untuk password
// Rentan terhadap timing attacks
```

#### 3. **Key Rotation** ❌
```typescript
// BELUM ADA automatic key rotation
// Master key statis selamanya
```

#### 4. **Memory Sanitization** ⚠️
```typescript
// Password masih tersimpan di memory sejenak
// Perlu explicit zeroing setelah derive key
```

#### 5. **Dynamic Salt Strategy** ⚠️
```typescript
// Salt saat ini fixed per vault
// Perlu dynamic salt rotation untuk extra security
```

---

## 🚀 Prompt untuk Antigravity (UI/UX Debugging)

```markdown
# Debug UI/UX Design & Frontend - Lembaranz v3.4.0

## Konteks Proyek
**Lembaranz** adalah brankas arsip digital personal dengan fokus pada:
- Enkripsi zero-knowledge (AES-GCM 256-bit, Argon2id)
- CLI/TUI-first untuk developer productivity
- Local-first architecture (data tetap di perangkat)
- Buatan Indonesia 🇮🇩

**Tech Stack:**
- Next.js 16 (App Router)
- React 19.2.4
- Tailwind CSS v4
- Bun Runtime 1.3+
- TypeScript 5.x

## Masalah yang Perlu Diperbaiki

### 1. **TUI Logo Implementation** (HIGH PRIORITY)
**Referensi:** Gemini CLI (`gemini`), Claude Code (`claude`)

**Requirement:**
- Tampilkan logo Lembaranz di header TUI (seperti gemini/claude)
- Logo harus muncul saat aplikasi mulai
- Gunakan ASCII art atau Unicode box drawing
- Warna konsisten dengan brand (blue/purple gradient jika bisa)

**Contoh yang Diinginkan:**
```
╭────────────────────────────────────────────╮
│  📜 LEMBARANZ v3.4.0                        │
│  Brankas Arsip Digital Personal            │
╰────────────────────────────────────────────╯
```

**File untuk diubah:**
- `packages/cli/src/tui/MenuUtama.tsx`
- `packages/cli/src/tui/LayarSelamat.tsx`

---

### 2. **Visual Feedback untuk Vault Lock/Unlock** (MEDIUM PRIORITY)

**Problem:** User tidak tahu kapan vault terkunci/terbuka

**Solution yang Diinginkan:**
- Indicator visual di status bar (🔒 / 🔓)
- Color change: red (locked) → green (unlocked)
- Toast notification saat auto-lock
- Countdown timer sebelum auto-lock (opsional)

**File untuk diubah:**
- `packages/cli/src/tui/BarStatus.tsx`
- `packages/cli/src/Antarmuka.ts`

---

### 3. **Error Handling yang User-Friendly** (MEDIUM PRIORITY)

**Problem:** Error messages terlalu teknis

**Contoh Perbaikan:**
```
❌ SEBELUM: "Vault is locked. Cannot save data."
✅ SESUDAH: "Brankas terkunci! Buka dulu dengan 'lembaranz mulai'"

❌ SEBELUM: "Key derivation failed"
✅ SESUDAH: "Password salah! Silakan coba lagi"
```

**File untuk diubah:**
- `packages/cli/src/tui/LayarKredensial.tsx`
- `packages/cli/src/tui/LayarBukaBrankas.tsx`

---

### 4. **Responsive Layout untuk Mobile Terminal** (LOW PRIORITY)

**Problem:** TUI rusak di terminal kecil (VSCode integrated terminal)

**Solution:**
- Detect terminal width
- Fallback ke compact mode jika < 80 columns
- Hide decorative elements di small screens
- Maintain functionality di semua sizes

---

### 5. **Accessibility Improvements** (LOW PRIORITY)

**Checklist:**
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader support untuk error messages
- [ ] High contrast mode untuk visually impaired
- [ ] Reduced motion option

---

## Security Hardening yang Diperlukan

### 1. **Rate Limiting Implementation**
```typescript
// Tambahkan di Brankas.ts atau Sentinel.ts
interface RateLimitState {
    attempts: number;
    lastAttempt: number;
    lockoutUntil?: number;
}

// Max 5 attempts per minute
// Lockout 5 minutes setelah 5 failed attempts
```

### 2. **Constant-Time Password Comparison**
```typescript
// Ganti string comparison biasa dengan constant-time
function constantTimeCompare(a: string, b: string): boolean {
    // Implementasi untuk prevent timing attacks
}
```

### 3. **Dynamic Salt Rotation**
```typescript
// Salt rotation setiap 30 hari atau setiap password change
interface VaultMetadata {
    salt: Uint8Array;
    saltCreatedAt: string;
    nextSaltRotation: string;
}
```

### 4. **Memory Sanitization**
```typescript
// Zero out password setelah derive key
function sanitizePassword(password: string): void {
    // Explicit memory clearing
}
```

---

## Testing Requirements

### Unit Tests yang Perlu Ditambah:
- [ ] Rate limiting logic
- [ ] Constant-time comparison
- [ ] Salt rotation schedule
- [ ] Memory sanitization
- [ ] Auto-lock timer

### Integration Tests:
- [ ] Brute-force protection (10 failed attempts)
- [ ] Auto-lock setelah idle
- [ ] Panic key functionality
- [ ] Key rotation process

---

## Deliverables

1. **TUI Logo** - ASCII/Unicode logo di header
2. **Visual Indicators** - Lock/unlock status yang jelas
3. **Error Messages** - User-friendly, Bahasa Indonesia
4. **Security Hardening** - Rate limiting, constant-time, dll
5. **Test Coverage** - >80% untuk security-critical code

---

## Priority Order

1. 🔴 **HIGH:** TUI Logo (branding & UX)
2. 🔴 **HIGH:** Error handling yang user-friendly
3. 🟡 **MEDIUM:** Visual vault status indicators
4. 🟡 **MEDIUM:** Security hardening (rate limiting, dll)
5. 🟢 **LOW:** Responsive layout
6. 🟢 **LOW:** Accessibility improvements

---

## Contact & Support

Jika ada pertanyaan atau butuh klarifikasi:
- GitHub Issues: https://github.com/Abelion512/lembaranz/issues
- Email: agen.salva@gmail.com
- Dokumentasi: https://lembaranz.vercel.app/bantuan

**Made with ❤️ in Indonesia 🇮🇩**
```

---

## 🔐 Rekomendasi Keamanan Tambahan

### **Immediate Actions (Week 1):**
1. ✅ Implement rate limiting untuk unlock attempts
2. ✅ Add constant-time password comparison
3. ✅ Improve error messages (no info leakage)
4. ✅ Add visual vault status indicators

### **Short-term (Month 1):**
1. ⏳ Implement dynamic salt rotation
2. ⏳ Add memory sanitization
3. ⏳ Implement key rotation (setiap 90 hari)
4. ⏳ Add biometric unlock support (WebAuthn)

### **Long-term (Quarter 1):**
1. ⏳ Hardware security key support (YubiKey)
2. ⏳ Multi-factor authentication
3. ⏳ Encrypted backup ke personal cloud
4. ⏳ Security audit oleh third-party

---

## 📊 Security Scorecard

| Category | Status | Score |
|----------|--------|-------|
| Encryption | ✅ Implemented | 10/10 |
| Key Derivation | ✅ Argon2id | 10/10 |
| Rate Limiting | ❌ Missing | 0/10 |
| Constant-Time | ❌ Missing | 0/10 |
| Memory Safety | ⚠️ Partial | 5/10 |
| Key Rotation | ❌ Missing | 0/10 |
| Auto-Lock | ✅ Implemented | 10/10 |
| Panic Key | ✅ Implemented | 10/10 |
| **Overall** | | **56/100** |

**Target:** Minimal 80/100 sebelum production release

---

**Dibuat:** 28 Maret 2026  
**Versi:** 3.4.0  
**Status:** Action Required 🔴
