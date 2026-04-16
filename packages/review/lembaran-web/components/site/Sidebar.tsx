"use client";

import React from "react";

const DOCS_LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/security", label: "Security" },
  { href: "/docs/vault", label: "Vault Management" },
  { href: "/docs/platforms", label: "Platforms" },
];

type SidebarProps = { className?: string };

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={className}>
      <nav className="sticky top-24 space-y-1">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-3">
          Documentation
        </p>
        {DOCS_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="block px-3 py-1.5 text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
