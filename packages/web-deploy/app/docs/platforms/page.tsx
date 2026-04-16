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
  Image as ImageIcon,
} from "lucide-react";

const PLATFORMS = [
  {
    icon: Terminal,
    label: "Native CLI",
    status: "Production",
    id: "cli",
    desc: "Fast terminal-first workflow for developers. Execute single commands instantly without visual overhead.",
    audience: "Developers & DevOps",
    commands: "lembaranz gui • lembaranz setup",
  },
  {
    icon: Monitor,
    label: "TUI Dashboard",
    status: "Production",
    id: "tui",
    desc: "A beautiful interactive Terminal User Interface built inherently into the CLI. Full visual vault management straight from the terminal.",
    audience: "Console Power Users",
    commands: "lembaranz (default action)",
  },
  {
    icon: Globe,
    label: "Local Web GUI",
    status: "Production",
    id: "gui",
    desc: "A lightweight local web server providing a browser-based dashboard. Perfect for users who prefer mouse interactions while exploring their credentials securely at localhost:1401.",
    audience: "Visual Users",
    commands: "lembaranz gui",
  },
];

const STATUS_STYLES: Record<string, string> = {
  Production:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Planned: "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500",
};

export default function PlatformsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Platforms</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        One vault. Multiple ways to access it.
      </p>
      <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs">Platform comparison</p>
        <p className="text-[10px] text-zinc-400 mt-1">
          1200 × 675px recommended
        </p>
      </div>
      <div id="cli" className="space-y-6 mb-12">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800"
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
                        : "text-zinc-400 dark:text-zinc-500"
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
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
                    {p.desc}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                    For: {p.audience}
                  </p>
                  <div className="p-4 rounded-xl bg-zinc-900 dark:bg-zinc-800 font-mono text-xs text-white/70">
                    {p.commands}
                  </div>
                  {p.status === "Planned" && (
                    <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-lg text-sm font-medium cursor-not-allowed">
                      Coming Soon <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
