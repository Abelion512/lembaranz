"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, Image as ImageIcon } from "lucide-react";

const COMMANDS = [
  {
    cmd: "lembaran setup",
    desc: "Interactive wizard to create your vault",
    tag: "first-time",
  },
  {
    cmd: "lembaran launch",
    desc: "Open the interactive TUI dashboard",
    tag: "daily",
  },
  {
    cmd: "lembaran settings KEY VALUE",
    desc: "Store a credential directly",
    tag: "daily",
  },
  {
    cmd: "lembaran config save [tag]",
    desc: "Save .env to vault with project tag",
    tag: "daily",
  },
  {
    cmd: "lembaran config load [tag]",
    desc: "Load credentials from vault",
    tag: "daily",
  },
  {
    cmd: "lembaran config list",
    desc: "List all stored credential profiles",
    tag: "daily",
  },
  {
    cmd: "lembaran browse [keyword]",
    desc: "Search credentials by tags/keywords",
    tag: "daily",
  },
  {
    cmd: "lembaran export",
    desc: "Export encrypted backup file",
    tag: "advanced",
  },
  {
    cmd: "lembaran security",
    desc: "View security dashboard",
    tag: "advanced",
  },
];

const TAG_COLORS: Record<string, string> = {
  "first-time":
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  daily: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  advanced:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export default function VaultPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">
        Vault Management
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        All commands to manage your encrypted credentials and .env files.
      </p>
      <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs">Vault management demo</p>
        <p className="text-[10px] text-zinc-400 mt-1">
          1200 × 675px recommended
        </p>
      </div>
      <section id="commands" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Commands</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMANDS.map((c) => (
            <div
              key={c.cmd}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <code className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {c.cmd}
                </code>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TAG_COLORS[c.tag]}`}
                >
                  {c.tag}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="backup" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Backup & Recovery</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Your vault is encrypted with your master password. If you forget it,
          use your 12-word recovery phrase to regain access.
        </p>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            ⚠️ Store your 12-word recovery phrase on paper. Never digitally.
          </p>
        </div>
      </section>
    </>
  );
}
