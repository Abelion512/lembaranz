"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-500">Lembaran</span>
          <span>v1.0.1</span>
          <span>MIT</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Terms
          </a>
          <a
            href="/changelog"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Changelog
          </a>
          <a
            href="https://github.com/Abelion512/lembaran/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Security
          </a>
          <a
            href="https://github.com/Abelion512/lembaran"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
