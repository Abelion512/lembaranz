"use client";

import React from "react";
import { X, Globe } from "lucide-react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  lang: string;
  setLang: (l: string) => void;
};

const LANG_OPTIONS = [
  { code: "en", label: "EN", name: "English" },
  { code: "id", label: "ID", name: "Indonesia" },
  { code: "zh", label: "ZH", name: "中文" },
];

export function MobileMenu({ open, onClose, lang, setLang }: MobileMenuProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 lg:hidden">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2">
          <X size={20} />
        </button>
        <nav className="mt-12 space-y-1">
          {[
            { href: "/", label: "Home" },
            { href: "/docs", label: "Docs" },
            { href: "/why", label: "Why" },
            { href: "/faq", label: "FAQ" },
            { href: "/changelog", label: "Changelog" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="block px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 mb-3 flex items-center gap-2">
            <Globe size={12} /> Language
          </p>
          <div className="space-y-1">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                }}
                className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${lang === l.code ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
              >
                {l.name}{" "}
                <span className="text-zinc-400 text-xs ml-1">({l.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
