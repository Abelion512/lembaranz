"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = {
  code: string;
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200/10 shadow-lg shadow-black/20 my-6 transition-all hover:bg-zinc-800/80">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-widest">
          {label || "terminal"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all text-white/40 hover:text-white hover:bg-white/10"
        >
          {copied ? (
            <Check size={12} className="text-green-400" />
          ) : (
            <Copy size={12} />
          ) }
          <span className={copied ? "text-green-400" : ""}>
            {copied ? "Copied" : "Copy" }
          </span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="text-[13px] font-mono text-zinc-300 leading-relaxed whitespace-pre font-medium block pr-8">
          {code}
        </code>
      </div>
    </div>
  );
}
