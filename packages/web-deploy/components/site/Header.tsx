"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  Menu,
  ChevronDown,
  Copy,
  FileText,
  ArrowUpRight,
  Download,
  FileDown,
  Sparkles,
} from "lucide-react";
import { UnifiedInteractionControl } from "./UnifiedInteractionControl";

// AI Logo SVGs
function ClaudeLogo({ size = 16 }: { size?: number }) {
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
function QwenLogo({ size = 16 }: { size?: number }) {
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
function DeepSeekLogo({ size = 16 }: { size?: number }) {
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

type HeaderProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  actionsOpen: boolean;
  setActionsOpen: (o: boolean) => void;
};

const NAV_LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/docs", labelKey: "docs", match: "/docs" },
  { href: "/why", labelKey: "why" },
  { href: "/faq", labelKey: "faq" },
  { href: "/changelog", labelKey: "changelog" },
];

type PageAction = { icon: React.ElementType; label: string; action: string };

function getActions(t: (key: string) => string): PageAction[] {
  return [
    { icon: Copy, label: t("copyPage"), action: "copy-md" },
    { icon: FileText, label: t("viewMarkdown"), action: "view-md" },
    {
      icon: ClaudeLogo as React.ElementType,
      label: "Ask Claude",
      action: "claude",
    },
    {
      icon: QwenLogo as React.ElementType,
      label: "Ask Qwen",
      action: "qwen",
    },
    {
      icon: DeepSeekLogo as React.ElementType,
      label: "Ask DeepSeek",
      action: "deepseek",
    },
    { icon: FileDown, label: t("exportPDF"), action: "export-pdf" },
  ];
}

export function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  actionsOpen,
  setActionsOpen,
}: HeaderProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const isActive = (link: (typeof NAV_LINKS)[number]) => {
    if (link.match) return pathname.startsWith(link.match);
    return pathname === link.href;
  };

  const actions = getActions(t);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">Lembaranzzzz</span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">
            v1.0.1
          </span>
        </a>
        <div className="hidden lg:flex items-center gap-0.5 text-sm text-zinc-600 dark:text-zinc-400">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md transition-colors ${isActive(l) ? "text-black dark:text-white font-medium bg-zinc-100 dark:bg-zinc-800" : "hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
            >
              {t(l.labelKey)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Actions dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setActionsOpen(!actionsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-full transition-all"
            >
              <Sparkles size={12} /> Actions
              <ChevronDown
                size={10}
                className={`transition-transform ${actionsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {actionsOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl">
                {actions.map((a) => (
                  <button
                    key={a.action}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <a.icon size={14} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{a.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Unified Interaction Dock */}
          <div className="hidden sm:block">
            <UnifiedInteractionControl />
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
