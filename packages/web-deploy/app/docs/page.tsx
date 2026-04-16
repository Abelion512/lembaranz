import React from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

function MediaPlaceholder() {
  return (
    <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
      <ImageIcon size={24} className="mb-2" />
      <p className="text-xs">Page screenshot / diagram</p>
      <p className="text-[10px] text-zinc-400 mt-1">1200 × 675px recommended</p>
    </div>
  );
}

export default function DocsIndex() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Documentation</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Learn how to install, configure, and use Lembaranzzz to manage your
        credentials securely.
      </p>
      <MediaPlaceholder />
      <div
        id="quick-start"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
      >
        <a
          href="/docs/installation"
          className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors no-underline group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Installation
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0">
            Install Lembaranzzz via curl, npm, bun, Docker, or git clone.
          </p>
        </a>
        <a
          href="/docs/security"
          className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors no-underline group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Security
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0">
            Deep dive into AES-GCM, Argon2id, and SHA-256 encryption.
          </p>
        </a>
        <a
          href="/docs/vault"
          className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors no-underline group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Vault Management
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0">
            Commands to manage your encrypted credentials and .env files.
          </p>
        </a>
        <a
          href="/docs/platforms"
          className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors no-underline group"
        >
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Platforms
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0">
            CLI, Desktop, and Web — three ways to access your vault.
          </p>
        </a>
      </div>
      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <pre className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-4 text-sm text-white/80 font-mono overflow-x-auto">
          <code>
            curl -sS
            https://raw.githubusercontent.com/Abelion512/lembaranz/main/install.sh
            | bash lembaranz setup lembaranz launch
          </code>
        </pre>
      </div>
    </>
  );
}
