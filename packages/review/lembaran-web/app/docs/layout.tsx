"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header, Footer, MobileMenu } from "@/components/site";
import {
  ChevronRight,
  Copy,
  FileText,
  ArrowUpRight,
  FileDown,
  PanelLeft,
  Globe,
  ChevronDown,
  Sparkles,
  Download,
} from "lucide-react";

// AI Logo SVGs
function ClaudeLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="#D97757"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function QwenLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#615EFC" strokeWidth="2" />
      <path
        d="M8 12l3 3 5-5"
        stroke="#615EFC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DeepSeekLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l8 4v6c0 5.25-3.5 10-8 11.5C7.5 22 4 17.25 4 12V6l8-4z"
        stroke="#4B70F5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type DocSection = { title: string; id: string }[];

const DOCS_LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/security", label: "Security" },
  { href: "/docs/vault", label: "Vault" },
  { href: "/docs/platforms", label: "Platforms" },
];

const PAGE_TOC: Record<string, DocSection> = {
  "/docs": [
    { title: "Overview", id: "#" },
    { title: "Quick Start", id: "#quick-start" },
  ],
  "/docs/installation": [
    { title: "CLI", id: "#cli" },
    { title: "Docker", id: "#docker" },
    { title: "From Source", id: "#from-source" },
  ],
  "/docs/security": [
    { title: "AES-GCM", id: "#aes-gcm" },
    { title: "Argon2id", id: "#argon2id" },
    { title: "SHA-256", id: "#sha-256" },
  ],
  "/docs/vault": [
    { title: "Commands", id: "#commands" },
    { title: "Backup", id: "#backup" },
  ],
  "/docs/platforms": [
    { title: "CLI", id: "#cli" },
    { title: "Desktop", id: "#desktop" },
    { title: "Web", id: "#web" },
  ],
};

function getActions(lang: string) {
  const t: Record<string, Record<string, string>> = {
    en: {
      copy: "Copy page",
      md: "View as Markdown",
      claude: "Ask Claude",
      qwen: "Ask Qwen",
      deepseek: "Ask DeepSeek",
      pdf: "Export as PDF",
    },
    id: {
      copy: "Salin halaman",
      md: "Lihat Markdown",
      claude: "Tanya Claude",
      qwen: "Tanya Qwen",
      deepseek: "Tanya DeepSeek",
      pdf: "Ekspor PDF",
    },
    zh: {
      copy: "复制页面",
      md: "查看 Markdown",
      claude: "询问 Claude",
      qwen: "询问 Qwen",
      deepseek: "询问 DeepSeek",
      pdf: "导出 PDF",
    },
  };
  const labels = t[lang] || t.en;
  return [
    { icon: Copy, label: labels.copy, action: "copy-md" },
    { icon: FileText, label: labels.md, action: "view-md" },
    { icon: ClaudeLogo, label: labels.claude, action: "claude" },
    { icon: QwenLogo, label: labels.qwen, action: "qwen" },
    { icon: DeepSeekLogo, label: labels.deepseek, action: "deepseek" },
    { icon: Download, label: labels.pdf, action: "export-pdf" },
  ];
}

function handleExport(action: string, title: string, content: string) {
  const mdContent = `# ${title}\n\n${content}`;
  switch (action) {
    case "copy-md":
      navigator.clipboard.writeText(mdContent);
      break;
    case "view-md": {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<pre style="white-space:pre-wrap;padding:20px;font-family:system-ui">${mdContent.replace(/</g, "&lt;")}</pre>`,
        );
        w.document.close();
      }
      break;
    }
    case "claude":
      window.open(
        `https://claude.ai/new?q=${encodeURIComponent(mdContent)}`,
        "_blank",
      );
      break;
    case "qwen":
      window.open(
        `https://chat.qwenlm.ai/?q=${encodeURIComponent(mdContent)}`,
        "_blank",
      );
      break;
    case "deepseek":
      window.open(
        `https://chat.deepseek.com/?q=${encodeURIComponent(mdContent)}`,
        "_blank",
      );
      break;
    case "export-pdf": {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<html><head><title>${title}</title></head><body style="font-family:system-ui;padding:40px;max-width:700px;margin:auto"><h1>${title}</h1>${content}</body></html>`,
        );
        w.document.close();
        setTimeout(() => w.print(), 500);
      }
      break;
    }
  }
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const pathname = usePathname();

  const toc = PAGE_TOC[pathname] || [];
  const currentPage = DOCS_LINKS.find((l) => pathname.startsWith(l.href));
  const contentRef = React.useRef<HTMLDivElement>(null);
  const actions = getActions(lang);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <Header
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        actionsOpen={actionsOpen}
        setActionsOpen={setActionsOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lang={lang}
        setLang={setLang}
      />

      <div className="max-w-360 mx-auto pt-14 flex min-h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - FIXED, no scroll */}
        <aside
          className={`fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-65 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Docs
            </span>
            <button onClick={() => setSidebarOpen(false)} className="p-1">
              <Globe size={16} className="text-zinc-400" />
            </button>
          </div>
          <nav className="overflow-y-auto h-[calc(100vh-3.5rem-44px)] p-3 space-y-0.5">
            {DOCS_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`block px-3 py-1.5 text-[13px] rounded-md transition-colors ${pathname === l.href ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main
            className="px-4 sm:px-8 lg:px-12 py-8 max-w-4xl mx-auto"
            ref={contentRef}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <PanelLeft size={16} />
              </button>
              <a
                href="/docs"
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Docs
              </a>
              <ChevronRight size={14} className="text-zinc-400" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                {currentPage?.label || "Overview"}
              </span>
            </div>

            {children}

            {/* Prev/Next buttons only */}
            <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
              {(() => {
                const idx = DOCS_LINKS.findIndex((l) =>
                  pathname.startsWith(l.href),
                );
                const prev = idx > 0 ? DOCS_LINKS[idx - 1] : null;
                const next =
                  idx < DOCS_LINKS.length - 1 ? DOCS_LINKS[idx + 1] : null;
                return (
                  <>
                    {prev && (
                      <a
                        href={prev.href}
                        className="flex-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group no-underline"
                      >
                        <p className="text-[11px] text-zinc-500 mb-1">
                          Previous
                        </p>
                        <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {prev.label}
                        </p>
                      </a>
                    )}
                    {next && (
                      <a
                        href={next.href}
                        className="flex-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group no-underline text-right"
                      >
                        <p className="text-[11px] text-zinc-500 mb-1">Next</p>
                        <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {next.label}
                        </p>
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          </main>
          <Footer />
        </div>

        {/* Right Sidebar - FIXED, no scroll */}
        <aside className="hidden xl:block w-55 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-hidden">
          <nav className="h-full overflow-y-auto py-8 px-4 space-y-3">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              On this page
            </p>
            <div className="space-y-0.5 border-l border-zinc-200 dark:border-zinc-800">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={item.id}
                  className="block text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors pl-3 border-l border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 -ml-px py-1"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
}
