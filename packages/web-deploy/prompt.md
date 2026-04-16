## User

1. saya sudah bilang bukan, kalau folder lembaranz-web belum pernah saya push dan memang landing page ini tidak saya push.
2. Tentu, ini adalah pemulihan kode khusus untuk direktori `lembaranz-web`. Saya sertakan file konfigurasi utama dan struktur aplikasi intinya agar Anda bisa segera menjalankan kembali proyeknya.

### 1. Konfigurasi Root (`lembaranz-web/`)

**package.json**
```json
{
  "name": "@lembaranzz/web",
  "version": "1.0.0",
  "private": true,
  "description": "Lembaranz landing page - Self-hosted credential manager",
  "scripts": {
    "dev": "next dev -p 1400",
    "build": "next build",
    "start": "next start -p 1400",
    "lint": "eslint app --ext .ts,.tsx"
  },
  "dependencies": {
    "@abelionorg/tagger-public": "^1.0.2",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.7",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^16.1.6",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**next.config.ts**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 2. Core Application (`lembaranz-web/app/`)

**layout.tsx**
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lembaranz — Your secrets should not be plaintext.",
  description: "Self-hosted, local-first, zero-knowledge credential manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

**page.tsx (Landing Page)**
```tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, ArrowRight, Monitor, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Header, Footer, MobileMenu } from "@/components/site";

const VERSION = "1.0.1";
const INSTALL_METHODS = [
  { label: "curl", command: "curl -sS https://lembaranzz.id/install.sh | bash" },
  { label: "npm", command: "npm install -g @lembaranzz/cli" },
  { label: "bun", command: "bun add -g @lembaranzz/cli" },
  {
    label: "docker",
    command: "docker run -it ghcr.io/Abelion512/lembaranzz:latest setup",
  },
  {
    label: "git",
    command:
      "git clone https://github.com/Abelion512/lembaranzz.git && cd lembaranzz && bun install",
  },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all bg-white/10 hover:bg-white/15 text-white/50 hover:text-white shrink-0"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      <span className={copied ? "text-green-400" : ""}>{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}

export default function Home() {
  const [theme, setTheme] = useState("device");
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (theme === "device")
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    else document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
      />
      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium mb-6">
              Self-Hosted Credential Manager
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight">
              Your secrets<br />
              <span className="text-black/30 dark:text-white/30">should not be plaintext.</span>
            </h1>
            <p className="text-base md:text-lg text-black/50 dark:text-white/50 mb-12 max-w-xl mx-auto leading-relaxed">
              Encrypts your API keys, passwords, and <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">.env</code> files with AES-GCM 256-bit. No cloud. No tracking.
            </p>

            <div className="max-w-xl mx-auto mb-12">
              <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                <div className="flex items-center px-6 pt-4 pb-2 gap-1 overflow-x-auto">
                  {INSTALL_METHODS.map((m, i) => (
                    <button
                      key={m.label}
                      onClick={() => setActive(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${active === i ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="px-6 pb-4 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-green-400 font-mono text-sm shrink-0">$</span>
                    <code className="text-white font-mono text-sm truncate">{INSTALL_METHODS[active].command}</code>
                  </div>
                  <CopyBtn text={INSTALL_METHODS[active].command} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-black/80 dark:hover:bg-white/90 transition-colors">
                Read the Docs <ArrowRight size={14} />
              </Link>
              <a href="https://github.com/Abelion512/lembaranzz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**globals.css**
```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

### 3. Struktur Dokumentasi (`lembaranz-web/app/docs/`)

**layout.tsx**
```tsx
import React from "react";
import { Header, Footer, Sidebar } from "@/components/site";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <div className="max-w-7xl mx-auto px-6 flex gap-12 pt-24 pb-20">
        <Sidebar className="hidden lg:block w-64 shrink-0" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
```

Saya masih punya file lain seperti halaman **FAQ**, **Changelog**, **Privacy Policy**, dan detail **Docs** (Security, Vault, Installation). Jika butuh file spesifik dari daftar itu, langsung saja bilang ya. Jangan biarkan AI itu menghapus semangat coding Anda!
3. Tenang, saya mengerti. Ini adalah sisa berkas dari direktori `lembaranz-web` yang belum terkirim agar Anda bisa memulihkan seluruh proyeknya. Jangan biarkan insiden "AI bodoh" itu menghentikan progres Anda.

### 1. Berkas Konfigurasi Tambahan

**eslint.config.mjs**
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

**postcss.config.mjs**
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**.gitignore**
```text
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

### 2. Halaman Utama Aplikasi (`app/`)

**app/why/page.tsx**
```tsx
"use client";

import React from "react";
import { Header, Footer } from "@/components/site";
import { Shield, Zap, Lock, EyeOff } from "lucide-react";

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Why Lembaranz?</h1>
        <div className="grid gap-12">
          <section>
            <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
              <Shield size={24} />
              <h2 className="text-2xl font-semibold text-black dark:text-white">Kedaulatan Data</h2>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Di era pengawasan massal, data Anda adalah aset paling berharga. Lembaranz memastikan bahwa rahasia Anda tidak pernah meninggalkan perangkat Anda tanpa enkripsi zero-knowledge yang kuat.
            </p>
          </section>
          {/* Section lainnya: Performa (Zap), Privasi (EyeOff), Keamanan (Lock) */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**app/faq/page.tsx**
```tsx
"use client";

import React from "react";
import { Header, Footer } from "@/components/site";

const FAQS = [
  {
    q: "Apakah Lembaranz menyimpan password saya di server?",
    a: "Tidak. Lembaranz adalah local-first. Semua data disimpan secara lokal di perangkat Anda dalam bentuk terenkripsi AES-GCM 256-bit."
  },
  {
    q: "Bagaimana jika saya lupa Master Password?",
    a: "Karena kami tidak menyimpan data Anda, tidak ada cara untuk memulihkan password tersebut kecuali Anda memiliki Recovery Phrase."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h1>
        <div className="space-y-8">
          {FAQS.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### 3. Dokumentasi Teknis (`app/docs/`)

**app/docs/page.tsx**
```tsx
import React from "react";

export default function DocsIndex() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Dokumentasi Lembaranz</h1>
      <p>Selamat datang di pusat bantuan teknis Lembaranz. Pilih topik di samping untuk mulai mempelajari cara mengamankan data Anda.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <a href="/docs/installation" className="p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors no-underline">
          <h3 className="mt-0">Instalasi</h3>
          <p className="text-sm mb-0">Cara memasang CLI Lembaranz di berbagai platform.</p>
        </a>
        <a href="/docs/security" className="p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors no-underline">
          <h3 className="mt-0">Keamanan</h3>
          <p className="text-sm mb-0">Detail teknis mengenai algoritma enkripsi yang digunakan.</p>
        </a>
      </div>
    </div>
  );
}
```

**app/docs/installation/page.tsx**
```tsx
import React from "react";

export default function InstallationDocs() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Instalasi</h1>
      <p>Lembaranz dapat diinstal melalui beberapa metode berikut:</p>
      
      <h3>1. Menggunakan Curl (Rekomendasi)</h3>
      <pre><code>curl -sS https://lembaranzz.id/install.sh | bash</code></pre>
      
      <h3>2. Menggunakan NPM</h3>
      <pre><code>npm install -g @lembaranzz/cli</code></pre>

      <h3>3. Menggunakan Docker</h3>
      <pre><code>docker run -it ghcr.io/Abelion512/lembaranzz:latest setup</code></pre>
    </div>
  );
}
```

**app/docs/security/page.tsx**
```tsx
import React from "react";

export default function SecurityDocs() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Keamanan & Enkripsi</h1>
      <p>Lembaranz menggunakan standar industri untuk memastikan data Anda aman.</p>
      <ul>
        <li><strong>AES-GCM 256-bit:</strong> Digunakan untuk enkripsi konten data.</li>
        <li><strong>Argon2id:</strong> Digunakan untuk Key Derivation dari Master Password Anda.</li>
        <li><strong>SHA-256:</strong> Digunakan sebagai Digital Seal untuk memastikan integritas data (anti-tamper).</li>
      </ul>
    </div>
  );
}
```

Saya masih memiliki file lain seperti `app/privacy/page.tsx`, `app/terms/page.tsx`, dan detail `docs` lainnya (`vault`, `platforms`). Apakah Anda ingin saya kirimkan sisanya sekarang juga?
4. Mohon maaf atas ketidaknyamanannya. Saya mengerti Anda ingin segera memulihkan seluruh proyek tanpa harus bolak-balik menjawab. 

Berikut adalah seluruh sisa berkas dari direktori `lembaranz-web` yang belum terkirim secara lengkap dalam satu balasan ini (termasuk versi final dari layout utama, konfigurasi, dan variabel environment). Silakan langsung disalin ke editor Anda.

### 1. `lembaranz-web/app/terms/page.tsx`
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";

export default function TermsPage() {
  const [theme, setTheme] = useState("device");
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "device")
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    else document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
      />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-10">
          Last updated: April 13, 2026
        </p>
        <div className="space-y-6">
          {[
            {
              title: "MIT License",
              desc: "Lembaranzz is distributed under the MIT License. You are free to use, modify, and distribute the software.",
            },
            {
              title: "No Warranty",
              desc: "The software is provided 'as is', without warranty of any kind. Use at your own risk.",
            },
            {
              title: "Your Responsibility",
              desc: "You are solely responsible for securing your password and recovery phrase. We cannot recover lost credentials.",
            },
            {
              title: "No Liability",
              desc: "The authors shall not be liable for any damages arising from the use of this software.",
            },
            {
              title: "Open Source",
              desc: "Full source code is available at github.com/Abelion512/lembaranzz. You may audit, modify, and contribute.",
            },
          ].map((t) => (
            <div
              key={t.title}
              className="p-4 rounded-xl border border-black/5 dark:border-white/5"
            >
              <h3 className="text-sm font-semibold mb-1">{t.title}</h3>
              <p className="text-sm text-black/50 dark:text-white/50">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-6 border-t border-black/5 dark:border-white/5 text-xs text-black/40 dark:text-white/40">
          <p>
            For the full terms, see our{" "}
            <a
              href="https://github.com/Abelion512/lembaranzz/blob/main/TERMS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub TERMS.md
            </a>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

### 2. `lembaranz-web/app/changelog/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";
import { RELEASES } from "@/lib/changelog-data";
import { Check, Plus, ArrowRightCircle, AlertCircle } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  added: "text-green-600 dark:text-green-400",
  changed: "text-blue-600 dark:text-blue-400",
  fixed: "text-orange-600 dark:text-orange-400",
  removed: "text-red-600 dark:text-red-400",
};

const TYPE_ICONS: Record<string, typeof Plus> = {
  added: Plus,
  changed: ArrowRightCircle,
  fixed: Check,
  removed: AlertCircle,
};

export default function ChangelogPage() {
  const [theme, setTheme] = useState("device");
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "device")
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    else document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
      />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-10">
          All notable changes to this project.
        </p>
        <div className="space-y-12">
          {RELEASES.map((r) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rel = r as any;
            return (
              <div key={rel.version} className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold font-mono">
                    v{rel.version}
                  </span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {rel.date}
                  </span>
                  {rel.tag === "latest" && (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                      Latest
                    </span>
                  )}
                  {rel.tag === "legacy" && (
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-black/40 dark:text-white/40 rounded-full font-medium">
                      Legacy
                    </span>
                  )}
                </div>
                {rel.note && (
                  <p className="text-xs text-black/40 dark:text-white/40 mb-3 italic">
                    {rel.note}
                  </p>
                )}
                <p className="text-sm text-black/50 dark:text-white/50 mb-4">
                  {rel.summary}
                </p>

                {rel.stats && (
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {rel.stats.added > 0 && (
                      <span className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Plus size={12} />
                        {rel.stats.added} added
                      </span>
                    )}
                    {rel.stats.changed > 0 && (
                      <span className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <ArrowRightCircle size={12} />
                        {rel.stats.changed} changed
                      </span>
                    )}
                    {rel.stats.fixed > 0 && (
                      <span className="text-xs flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Check size={12} />
                        {rel.stats.fixed} fixed
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-4 pl-4 border-l-2 border-black/5 dark:border-white/5">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {rel.changes.map((c: any) => {
                    const Icon = TYPE_ICONS[c.type] || Plus;
                    return (
                      <div key={c.type}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className={TYPE_COLORS[c.type]} />
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${TYPE_COLORS[c.type]}`}
                          >
                            {c.type}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {c.items.map((item: string) => (
                            <li
                              key={item}
                              className="text-sm text-black/60 dark:text-white/60 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-black/15 dark:bg-white/15 mt-2 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

### 3. `lembaranz-web/app/docs/vault/page.tsx`
```tsx
"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

const COMMANDS = [
  { cmd: "lembaranz setup", desc: "Interactive wizard to create your vault", tag: "first-time" },
  { cmd: "lembaranz launch", desc: "Open the interactive TUI dashboard", tag: "daily" },
  { cmd: "lembaranz ukir", desc: "Add or edit credentials in your vault", tag: "daily" },
  { cmd: "lembaranz muat", desc: "Load .env credentials into current project", tag: "daily" },
  { cmd: "lembaranz browse", desc: "Search credentials by tags or keywords", tag: "daily" },
  { cmd: "lembaranz security", desc: "View security dashboard and audit log", tag: "advanced" },
];

const TAG_COLORS: Record<string, string> = {
  "first-time": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  daily: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  advanced: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export default function VaultPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Vault Management</h1>
      <p className="text-sm text-black/50 dark:text-white/50 mb-8">All commands to manage your encrypted vault.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {COMMANDS.map((c) => (
          <div key={c.cmd} className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-xs font-mono text-blue-600 dark:text-blue-400">{c.cmd}</code>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TAG_COLORS[c.tag]}`}>{c.tag}</span>
            </div>
            <p className="text-xs text-black/50 dark:text-white/50">{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-black/5 dark:border-white/5 flex justify-between">
        <Link href="/docs/security" className="inline-flex items-center gap-2 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"><ArrowLeft size={14} /> Security</Link>
        <Link href="/docs/platforms" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">Platforms <ArrowRight size={14} /></Link>
      </div>
    </>
  );
}
```

### 4. `lembaranz-web/app/docs/platforms/page.tsx`
```tsx
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Terminal,
  Monitor,
  Globe,
  Check,
  Clock,
} from "lucide-react";

const PLATFORMS = [
  {
    icon: Terminal,
    label: "CLI",
    status: "Production",
    desc: "Terminal-first workflow for developers. Full TUI with vault management, encrypted `.env` handling, and auto-completion.",
    audience: "Developers & DevOps",
    commands:
      "lembaranz setup • lembaranz ukir • lembaranz muat • lembaranz browse",
  },
  {
    icon: Monitor,
    label: "Desktop App",
    status: "Planned",
    desc: "Native desktop app built with Tauri. Visual credential management with search, tags, and encrypted editing.",
    audience: "Users who prefer GUI",
    commands: "Visual editor • Tag system • Export to file • System tray",
  },
  {
    icon: Globe,
    label: "Web Dashboard",
    status: "Planned",
    desc: "Browser-based dashboard for teams. Self-hosted via Docker with role-based access control and audit logs.",
    audience: "Teams & organizations",
    commands: "docker compose up • RBAC • Audit logs • API access",
  },
];

const STATUS_STYLES: Record<string, string> = {
  Production:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Planned: "bg-zinc-100 dark:bg-zinc-800 text-black/40 dark:text-white/40",
};

export default function PlatformsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Platforms</h1>
      <p className="text-sm text-black/50 dark:text-white/50 mb-8">
        One vault. Three ways to access it.
      </p>
      <div className="space-y-6 mb-12">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className="p-8 rounded-2xl border border-black/5 dark:border-white/5"
            >
              <div className="flex items-start gap-6">
                <div
                  className={`w-14 h-14 rounded-xl ${p.status === "Production" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800/50"} flex items-center justify-center shrink-0`}
                >
                  <Icon
                    size={24}
                    className={
                      p.status === "Production"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-black/30 dark:text-white/30"
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{p.label}</h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${STATUS_STYLES[p.status]}`}
                    >
                      {p.status === "Production" ? (
                        <Check size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-3 leading-relaxed">
                    {p.desc}
                  </p>
                  <p className="text-xs text-black/30 dark:text-white/30 mb-4">
                    For: {p.audience}
                  </p>
                  <div className="p-4 rounded-xl bg-zinc-900 dark:bg-zinc-800 font-mono text-xs text-white/70">
                    {p.commands}
                  </div>
                  {p.status === "Planned" && (
                    <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-black/40 dark:text-white/40 rounded-lg text-sm font-medium cursor-not-allowed">
                      Coming Soon <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 pt-6 border-t border-black/5 dark:border-white/5 flex justify-between">
        <Link
          href="/docs/vault"
          className="inline-flex items-center gap-2 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Vault Management
        </Link>
        <span></span>
      </div>
    </>
  );
}
```

### 5. `lembaranz-web/app/privacy/page.tsx`
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { Shield, Eye, Database, CloudOff, Lock } from "lucide-react";
import { Header, Footer, MobileMenu } from "@/components/site";

export default function PrivacyPage() {
  const [theme, setTheme] = useState("device");
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "device")
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    else document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
      />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-10">
          Last updated: April 13, 2026
        </p>
        <div className="space-y-8">
          {[
            {
              icon: Shield,
              color: "text-green-500",
              title: "Zero Data Collection",
              desc: "Lembaranzz does not collect, store, or transmit any of your data. All encryption and decryption happens locally on your device.",
            },
            {
              icon: Eye,
              color: "text-blue-500",
              title: "No Telemetry",
              desc: "We do not track your usage, analytics, or behavior. No analytics services, no tracking cookies, no telemetry.",
            },
            {
              icon: Database,
              color: "text-purple-500",
              title: "Local Storage Only",
              desc: "Your vault is stored at ~/.lembaranz/vault.db on your device. We have no servers that store your data.",
            },
            {
              icon: CloudOff,
              color: "text-orange-500",
              title: "No Cloud Sync",
              desc: "Lembaranzz does not sync your data to any cloud service. Your credentials never leave your device unless you explicitly export them.",
            },
            {
              icon: Lock,
              color: "text-red-500",
              title: "No Account Required",
              desc: "Lembaranzz does not require you to create an account, provide an email, or share any personal information.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-4 p-4 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50"
            >
              <s.icon size={20} className={`${s.color} shrink-0 mt-0.5`} />
              <div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-6 border-t border-black/5 dark:border-white/5 text-xs text-black/40 dark:text-white/40">
          <p>
            For the full policy, see our{" "}
            <a
              href="https://github.com/Abelion512/lembaranzz/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub PRIVACY.md
            </a>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

### 6. `lembaranz-web/app/layout.tsx`
*(Versi lengkap dengan metadata SEO)*
```tsx
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lembaranzz — Self-Hosted Credential Manager",
    template: "%s — Lembaranzz",
  },
  description:
    "A free, open-source credential manager with zero-knowledge encryption. Encrypt API keys, passwords, and .env files locally. No cloud, no account, no tracking.",
  keywords: [
    "credential manager",
    "encrypted vault",
    "zero-knowledge",
    "self-hosted",
    "password manager",
    "local-first",
    "API key manager",
    "env file encryption",
    "secrets management",
    "open source password manager",
  ],
  authors: [{ name: "Abelion Lavv", url: "https://github.com/Abelion512" }],
  creator: "Abelion Lavv",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lembaranzz",
    title: "Lembaranzz — Self-Hosted Credential Manager",
    description:
      "A free, open-source credential manager with zero-knowledge encryption. Encrypt API keys, passwords, and .env files locally.",
  },
  twitter: {
    card: "summary",
    title: "Lembaranzz — Self-Hosted Credential Manager",
    description:
      "Free, open-source credential manager with AES-GCM 256-bit encryption. No cloud, no account.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Lembaranzz",
      description:
        "A self-hosted, zero-knowledge credential manager that encrypts API keys, passwords, and .env files with AES-GCM 256-bit encryption.",
      url: "https://github.com/Abelion512/lembaranzz",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Cross-platform",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      license: "https://opensource.org/licenses/MIT",
      author: {
        "@type": "Person",
        name: "Abelion Lavv",
        url: "https://github.com/Abelion512",
      },
    },
    {
      "@type": "WebSite",
      name: "Lembaranzz",
      url: "https://lembaranzz.id",
      description:
        "Self-hosted credential manager with zero-knowledge encryption",
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://github.com/Abelion512/lembaranzz/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Lembaranzz?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A free, open-source tool that encrypts your API keys, passwords, and .env files. Everything stays on your computer. No cloud account needed.",
          },
        },
        {
          "@type": "Question",
          name: "Is Lembaranzz safe?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Uses AES-GCM 256-bit encryption — the same standard banks use. Your password and recovery phrase are never stored or transmitted.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install Lembaranzz?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Install via npm (npm install -g @lembaranzz/cli), bun, curl one-liner, Docker, or git clone.",
          },
        },
        {
          "@type": "Question",
          name: "Does Lembaranzz work offline?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Lembaranzz is designed to work 100% offline. No internet connection is required for any operation.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-white text-black">{children}</body>
    </html>
  );
}
```

### 7. `lembaranz-web/app/globals.css`
*(Versi dengan konfigurasi scrollbar kustom)*
```css
@import "tailwindcss";

@layer base {
    html {
        scroll-behavior: smooth;
    }

    body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Scrollbar — matches theme */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    /* Light mode: dark thumb */
    ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 9999px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.35);
    }

    /* Dark mode: white thumb — via .dark class on <html> */
    html.dark ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
    }

    html.dark ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Firefox */
    * {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    }

    html.dark * {
        scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    }
}
```

### 8. `lembaranz-web/.env.local`
```env
# Created by Vercel CLI
AUTONOMA_CLIENT_ID="cmkvwl5hs000b016uqti8z9no"
AUTONOMA_SECRET_ID="328c9b1d917ba8a8f19dfa13771298aec6874b9d82b8e9198c827120759d4d5e921d0ca6b867b8bf80d6fceba50d760b"
VERCEL_OIDC_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9hYmVsaW9ucy1wcm9qZWN0cyIsInN1YiI6Im93bmVyOmFiZWxpb25zLXByb2plY3RzOnByb2plY3Q6bGVtYmFyYW46ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJzY29wZSI6Im93bmVyOmFiZWxpb25zLXByb2plY3RzOnByb2plY3Q6bGVtYmFyYW46ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJhdWQiOiJodHRwczovL3ZlcmNlbC5jb20vYWJlbGlvbnMtcHJvamVjdHMiLCJvd25lciI6ImFiZWxpb25zLXByb2plY3RzIiwib3duZXJfaWQiOiJ0ZWFtX09CbkNzN2JNYXNldnlpdWhINENhQ241ZSIsInByb2plY3QiOiJsZW1iYXJhbiIsInByb2plY3RfaWQiOiJwcmpfVTFFbmJtdjdrN0hzeU9uWDZVbGtUaGNrQVlHcyIsImVudmlyb25tZW50IjoiZGV2ZWxvcG1lbnQiLCJwbGFuIjoiaG9iYnkiLCJ1c2VyX2lkIjoickVSb1IweHJDV2tkazFuWjVNQ2xOZW1CIiwiY2xpZW50X2lkIjoiY2xfSFl5T1BCTnRGTWZIaGFVbjlMNFFQZlRaejZUUDQ3YnAiLCJuYmYiOjE3NzYwMTI1MzksImlhdCI6MTc3NjAxMjUzOSwiZXhwIjoxNzc2MDU1NzM5fQ.ETvRzkBMnuc0egdRIegOz9TxlSTRWNsPBrB9G1JhogeTtUpWXzfebPVXjRE8C-wWBX8fVBd4CpqKk3_Y24wQha0FUPl1-Ndqujoq4dLqqAoepkO7eJpM2RRj2cVtCNF88ZbMbw9QxdJaWE7MZ1tOibMw9_BrxEatGlusXciWhmJyNNYFzV53kF3zcpRAjtWsvOCy6_PKmaQhsXLzUN7KNBdgrdEzVuz3UwhwN_xzUA4-rxt-ygvhQLQ-lag9ER03EUv2I4pAVp--ZGzj49DzNBX3FUpywzPwwo8mZbN8Src72-RONHhYcj6xKhM2beAMyz74POhkSRX16j3CTbjl8g"
```

### 9. `lembaranz-web/next.config.ts`
*(Versi standalone final)*
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

### 10. `lembaranz-web/next-env.d.ts`
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### 11. `lembaranz-web/tsconfig.json`
*(Versi dengan aliases path yang terhubung ke modul core)*
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@lembaranzz/core": ["../core/src/index.ts"],
      "@lembaranzz/core/*": ["../core/src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

