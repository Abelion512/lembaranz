"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-600 dark:text-zinc-400 tracking-tight text-[13px]">
            Lembaranzzzz
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <span>v1.0.1</span>
          <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <span>MIT License</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("terms")}
          </Link>
          <Link
            href="/changelog"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("changelog")}
          </Link>
          <Link
            href="/security"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t("security")}
          </Link>
          <a
            href="https://github.com/Abelion512/lembaranz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-zinc-500 font-medium"
          >
            {t("github")}
          </a>
        </div>
      </div>
    </footer>
  );
}
