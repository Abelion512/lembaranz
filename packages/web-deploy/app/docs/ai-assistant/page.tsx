import React from "react";
import {
  Sparkles,
  Shield,
  Brain,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";

export default function AIAssistantPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <span className="text-[10px] px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium flex items-center gap-1.5">
          <Sparkles size={10} /> Coming Soon
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Ask anything about Lembaranzzz — features, security, installation, and
        more.
      </p>
      <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs">AI Assistant preview</p>
        <p className="text-[10px] text-zinc-400 mt-1">
          1200 × 675px recommended
        </p>
      </div>
      <section id="overview" className="mb-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          The AI Assistant will help you understand and manage your vault using
          natural language. Ask questions, get recommendations, and learn best
          practices — all powered locally on your device.
        </p>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
          <p className="text-xs text-purple-700 dark:text-purple-300">
            All AI processing happens locally. No data is sent to external
            servers.
          </p>
        </div>
      </section>
      <section id="features" className="mb-12">
        <h2 className="text-lg font-semibold mb-6">Planned Features</h2>
        <div className="grid gap-4">
          {[
            {
              icon: Shield,
              title: "Security Audit",
              desc: "AI analyzes your credentials for weak passwords and suggests improvements.",
            },
            {
              icon: Brain,
              title: "Smart Classification",
              desc: "Automatically tags and categorizes credentials as you add them.",
            },
            {
              icon: MessageSquare,
              title: "Contextual Quick Action",
              desc: "Instantly create actionable setup prompts tailored for top-tier LLMs like Claude, Qwen, and DeepSeek to help you understand the architecture of Lembaranzzzz.",
            },
            {
              icon: Sparkles,
              title: "Auto-Generation",
              desc: "Generate strong, unique passwords with AI-powered suggestions.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <f.icon size={18} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="llm-prompts" className="mb-12">
        <h2 className="text-lg font-semibold mb-6">Master Prompt for LLMs</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Want to ask an external LLM (like Claude, ChatGPT, or DeepSeek) to act as a Lembaranzzzz expert? Copy and paste the prompt below to give it full context:
        </p>

        <div className="relative group">
          <div className="p-4 bg-zinc-900 rounded-xl font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
            <pre><code>You are an expert technical assistant for 'Lembaranzzzz', a self-hosted, local-first, zero-knowledge credential manager.

Core Context:
- Architecture: TUI-first (Terminal User Interface) built with TypeScript, Node.js, and Bun. Optional local Web GUI.
- Cryptography: AES-GCM 256-bit encryption, Argon2id (t:3, m:65536) for Key Derivation. Uses Native Web Crypto API.
- Storage: JSON-based physical file structure, 100% local. No cloud syncing.
- Security Policy: All data is encrypted at rest. No telemetry. 5-minute decryption cache TTL.

As a Lembaranzzzz expert, please concisely explain its purpose, how standard terminal usage works, and help me troubleshoot my current issue. Prioritize security over convenience in all your answers.</code></pre>
          </div>
        </div>
      </section>
    </div>
  );
}
