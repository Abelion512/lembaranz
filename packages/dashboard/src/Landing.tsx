import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Github,
  KeyRound,
  Lock,
  Server,
  Sparkles,
  Terminal,
  WifiOff,
} from 'lucide-react';
import { CustomizationPreview } from '../components/landing/CustomizationPreview';

const WORDS = ['Berdikari.', 'Terenkripsi.', 'Offline-First.', 'Milik Anda.'];
const INSTALL_CURL = 'curl -fsSL https://lembaranz.vercel.app/install.sh | bash';

const FEATURES = [
  {
    icon: Lock,
    title: 'Zero-Knowledge AES-GCM',
    body: 'Enkripsi 256-bit terjadi di perangkat Anda. Kunci tidak pernah meninggalkan brankas, tidak ada server yang bisa membaca isinya.',
    accent: 'text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: KeyRound,
    title: 'Argon2id',
    body: 'Kunci brankas diturunkan dengan Argon2id — tahan brute-force bahkan saat perangkat jatuh ke tangan orang lain.',
    accent: 'text-blue-400 bg-blue-500/10',
  },
  {
    icon: WifiOff,
    title: 'Offline-First',
    body: 'Semua data tersimpan di IndexedDB. Tanpa internet, tanpa cloud, tanpa akun — brankas tetap hidup di perangkat Anda.',
    accent: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: Server,
    title: 'Panic Key',
    body: 'Satu kata sandi panik menghapus seluruh data brankas secara permanen saat kondisi darurat. Kill-switch di ujung jari Anda.',
    accent: 'text-red-400 bg-red-500/10',
  },
  {
    icon: Terminal,
    title: 'CLI · TUI · Web',
    body: 'Terminal untuk otomasi dan server jarak jauh, web dashboard untuk visual — semuanya dari satu brankas yang sama.',
    accent: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: Sparkles,
    title: 'Open Source',
    body: 'Kode terbuka dan dapat diaudit siapa pun. Privasi tidak boleh berdasarkan janji — tapi bukti yang bisa dibaca.',
    accent: 'text-purple-400 bg-purple-500/10',
  },
];

const COMPARISON = [
  { feature: 'Aksesibilitas', cli: 'Terminal / SSH', web: 'Browser (Anywhere)', app: 'Desktop (Native)' },
  { feature: 'Biometrik', cli: '❌ Password Only', web: 'Planned (WebAuthn)', app: 'Yes (TouchID/FaceID)' },
  { feature: 'Kelebihan', cli: 'Ringan & Cepat', web: 'Tanpa Instalasi', app: 'Offline-First + Push' },
  { feature: 'Kelemahan', cli: 'Kurang Visual', web: 'Butuh Internet/Cache', app: 'Butuh Resource Lebih' },
  { feature: 'Saran Peran', cli: 'Senior / Master', web: 'Pemula / Junior', app: 'Explorer / Power User' },
];

const METHODS: Record<string, string> = {
  curl: INSTALL_CURL,
  npm: 'npm install -g @lembaranz/cli',
  bun: 'bun install -g @lembaranz/cli',
};

const ECOSYSTEM = [
  { label: 'iOS & Android', note: 'Push notifikasi + biometrik native' },
  { label: 'macOS & Windows', note: 'TouchID / FaceID unlock' },
  { label: 'Linux (Flatpak)', note: 'Distribusi ringan untuk semua distro' },
];

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [method, setMethod] = useState<keyof typeof METHODS>('curl');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={onEnter} className="flex items-center gap-2.5 group" title="Buka dashboard">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 group-hover:scale-105 transition-transform">
              <Lock size={16} />
            </span>
            <span className="font-bold tracking-tight">Lembaran<span className="text-cyan-400">.</span></span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#fitur" className="hover:text-cyan-400 transition-colors">Fitur</a>
            <a href="#banding" className="hover:text-cyan-400 transition-colors">Perbandingan</a>
            <a href="#install" className="hover:text-cyan-400 transition-colors">Install</a>
            <a href="#ekosistem" className="hover:text-cyan-400 transition-colors">Ekosistem</a>
            <a
              href="https://github.com/Abelion512/lembaranz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Github size={12} /> GitHub
            </a>
          </nav>

          <button
            onClick={onEnter}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:text-cyan-300 transition-all"
          >
            Buka Dashboard
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-5 text-center">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[46rem] h-[26rem] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-3xl mx-auto glass-enter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles size={12} />
            Brankas Aksara Personal · Zero-Knowledge
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[1.05] mb-6">
            <span className="text-slate-400">Aksara yang</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-500">
              {WORDS[wordIndex]}
            </span>
          </h1>

          <p className="text-sm md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Brankas aksara personal yang mengutamakan privasi absolut, performa instan,
            dan kecerdasan buatan on-device.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={onEnter}
              className="group relative px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
            >
              Mulai Menulis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://github.com/Abelion512/lembaranz"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 glass hover:bg-white/10 transition-all"
            >
              <Github size={16} /> Lihat Kode
            </a>
          </div>

          <button
            onClick={() => copy(INSTALL_CURL, 'hero')}
            className="mx-auto group flex items-center gap-3 px-5 py-3 rounded-xl glass font-mono text-xs text-emerald-400 hover:border-emerald-400/40 transition-all"
            title="Salin perintah install"
          >
            <span className="text-slate-500 select-none">❯</span>
            <span className="truncate max-w-[19rem] md:max-w-none">curl -fsSL …/install.sh | bash</span>
            {copiedId === 'hero' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-slate-500 group-hover:text-slate-300" />}
          </button>
        </div>
      </section>

      {/* ── Fitur ──────────────────────────────────────────── */}
      <section id="fitur" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Dibangun untuk Privasi</h2>
          <p className="text-slate-500 text-sm font-medium">
            Setiap lapisan dirancang agar data Anda tidak pernah keluar dari perangkat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-6 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-sm mb-2">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Perbandingan ───────────────────────────────────── */}
      <section id="banding" className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Pilih Konfigurasi Anda</h2>
          <p className="text-slate-500 text-sm font-medium">
            CLI, web, atau desktop — satu brankas, tiga cara mengakses.
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[36rem]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <th className="p-4 font-black">Dimensi</th>
                <th className="p-4 font-black text-cyan-400">CLI</th>
                <th className="p-4 font-black text-blue-400">WEB</th>
                <th className="p-4 font-black text-emerald-400">APP</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(row => (
                <tr key={row.feature} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">{row.feature}</td>
                  <td className="p-4 text-slate-200 font-mono">{row.cli}</td>
                  <td className="p-4 text-slate-200 font-mono">{row.web}</td>
                  <td className="p-4 text-slate-200 font-mono">{row.app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Install ────────────────────────────────────────── */}
      <section id="install" className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Pasang dalam Satu Baris</h2>
          <p className="text-slate-500 text-sm font-medium">
            Kompatibel dengan macOS, Linux, dan Windows (WSL).
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex gap-2">
              {Object.keys(METHODS).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m as keyof typeof METHODS)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    method === m ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40' : 'text-slate-500 border border-transparent hover:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={() => copy(METHODS[method], method)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {copiedId === method ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedId === method ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <div className="p-5 font-mono text-sm text-emerald-400 flex items-start gap-3">
            <span className="text-slate-600 select-none">❯</span>
            <code className="break-all">{METHODS[method]}</code>
          </div>
        </div>
      </section>

      {/* ── Kustomisasi (komponen glass yang sudah ada) ─────── */}
      <CustomizationPreview />

      {/* ── Ekosistem Native ───────────────────────────────── */}
      <section id="ekosistem" className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Ekosistem Native</h2>
          <p className="text-slate-500 text-sm font-medium">Sedang dalam pengembangan.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {ECOSYSTEM.map(e => (
            <div key={e.label} className="glass-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="text-sm font-bold mb-1">{e.label}</div>
              <div className="text-xs text-slate-500 mb-4">{e.note}</div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-600 mt-8">
          Lihat roadmap pengembangan di{' '}
          <a
            href="https://github.com/Abelion512/lembaranz/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-300 transition-colors"
          >
            GitHub Discussions
          </a>
          .
        </p>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-xl mt-10">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock size={14} />
            </span>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-200 tracking-tight">Lembaran</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-slate-600">© 2026 Lembaran Open Source</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-7 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#fitur" className="hover:text-cyan-400 transition-colors">Fitur</a>
            <a href="#install" className="hover:text-cyan-400 transition-colors">Install</a>
            <a
              href="https://github.com/Abelion512/lembaranz/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Lock size={11} /> Privacy
            </a>
            <a
              href="https://github.com/Abelion512/lembaranz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Github size={12} /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
