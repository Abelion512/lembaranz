import React from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function InstallationDocs() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Installation</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Choose the installation method that works best for you.
      </p>
      <div className="mb-8 p-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs font-medium">Replace with real installation demo</p>
        <p className="text-[10px] text-zinc-400 mt-1 text-center">
          Save your clean screenshot to <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">public/installation.png</code><br/>
          and update this container.
        </p>
      </div>
      <section id="cli" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">CLI (Recommended)</h2>
        <div className="space-y-0 relative">
          <CodeBlock 
            label="curl" 
            code="curl -fsSL https://lembaranzz.sh | bash" 
          />
          <CodeBlock 
            label="npm" 
            code="npm install -g @lembaranzz/cli" 
          />
          <CodeBlock 
            label="bun" 
            code="bun add -g @lembaranzz/cli" 
          />
        </div>
      </section>
      <section id="from-source" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">From Source</h2>
        <CodeBlock 
          label="git" 
          code="git clone https://github.com/Abelion512/lembaranz.git && cd lembaranz && bun install" 
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Clone the repository and install dependencies. Best for development.
        </p>
      </section>
    </>
  );
}
