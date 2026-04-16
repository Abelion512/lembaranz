import React from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

export default function InstallationDocs() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Installation</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Choose the installation method that works best for you.
      </p>
      <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs">Installation demo</p>
        <p className="text-[10px] text-zinc-400 mt-1">
          1200 × 675px recommended
        </p>
      </div>
      <section id="cli" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">CLI (Recommended)</h2>
        <div className="space-y-4 mb-6">
          {[
            {
              label: "curl",
              cmd: "curl -sS https://raw.githubusercontent.com/Abelion512/lembaran/main/install.sh | bash",
            },
            { label: "npm", cmd: "npm install -g @lembaranz/cli" },
            { label: "bun", cmd: "bun add -g @lembaranz/cli" },
          ].map((m) => (
            <div
              key={m.label}
              className="p-4 bg-zinc-900 dark:bg-zinc-800 rounded-xl"
            >
              <p className="text-xs text-white/40 mb-1">{m.label}</p>
              <code className="text-sm text-white/80 font-mono">{m.cmd}</code>
            </div>
          ))}
        </div>
      </section>
      <section id="docker" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Docker</h2>
        <div className="p-4 bg-zinc-900 dark:bg-zinc-800 rounded-xl mb-4">
          <code className="text-sm text-white/80 font-mono">
            docker run -it ghcr.io/Abelion512/lembaran:latest setup
          </code>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pull the latest image and run the interactive setup wizard inside a
          container.
        </p>
      </section>
      <section id="from-source" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">From Source</h2>
        <div className="p-4 bg-zinc-900 dark:bg-zinc-800 rounded-xl mb-4">
          <code className="text-sm text-white/80 font-mono">
            git clone https://github.com/Abelion512/lembaran.git && cd lembaran
            && bun install
          </code>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Clone the repository and install dependencies. Best for development.
        </p>
      </section>
    </>
  );
}
