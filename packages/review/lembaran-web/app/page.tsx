"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, ArrowRight, Monitor, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Header, Footer, MobileMenu } from "@/components/site";

const VERSION = "1.0.1";
const INSTALL_METHODS = [
  {
    label: "curl",
    command:
      "curl -sS https://raw.githubusercontent.com/Abelion512/lembaran/main/install.sh | bash",
  },
  { label: "npm", command: "npm install -g @lembaranz/cli" },
  { label: "bun", command: "bun add -g @lembaranz/cli" },
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
      {copied ? (
        <Check size={14} className="text-green-400" />
      ) : (
        <Copy size={14} />
      )}
      <span className={copied ? "text-green-400" : ""}>
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}

export default function Home() {
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lang={lang}
        setLang={setLang}
      />
      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium mb-6">
              Self-Hosted Credential Manager
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight">
              Your secrets
              <br />
              <span className="text-black/30 dark:text-white/30">
                should not be plaintext.
              </span>
            </h1>
            <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 mb-12 max-w-xl mx-auto leading-relaxed">
              Encrypts your API keys, passwords, and{" "}
              <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">
                .env
              </code>{" "}
              files with AES-GCM 256-bit. No cloud. No tracking.
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
                    <span className="text-green-400 font-mono text-sm shrink-0">
                      $
                    </span>
                    <code className="text-white font-mono text-sm truncate">
                      {INSTALL_METHODS[active].command}
                    </code>
                  </div>
                  <CopyBtn text={INSTALL_METHODS[active].command} />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-black/80 dark:hover:bg-white/90 transition-colors"
              >
                Read the Docs <ArrowRight size={14} />
              </Link>
              <a
                href="https://github.com/Abelion512/lembaran"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">v{VERSION}</div>
              <div className="text-xs text-zinc-400 mt-1">Stable Release</div>
            </div>
            <div>
              <div className="text-2xl font-bold">256-bit</div>
              <div className="text-xs text-zinc-400 mt-1">AES-GCM</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-zinc-400 mt-1">Local, No Cloud</div>
            </div>
            <div>
              <div className="text-2xl font-bold">MIT</div>
              <div className="text-xs text-zinc-400 mt-1">License</div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-lg font-bold mb-6 text-left">Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="text-2xl mb-3">⌨️</div>
              <h3 className="text-sm font-semibold">CLI</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Terminal-first workflow
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="text-2xl mb-3">
                <Monitor
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-sm font-semibold">Desktop</h3>
              <p className="text-xs text-zinc-500 mt-1">Native app (Tauri)</p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="text-2xl mb-3">
                <Globe size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold">Web</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Self-hosted via Docker
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
