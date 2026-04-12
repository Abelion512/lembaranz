'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const COMMANDS = {
    curl: 'curl -sS https://lembaran.id/install.sh | bash',
    bun: 'bun install -g @lembaranz/cli',
    npm: 'npm install -g @lembaranz/cli',
    yarn: 'yarn global add @lembaranz/cli',
};

export const TerminalInstall = () => {
    const [method, setMethod] = useState<keyof typeof COMMANDS>('curl');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = COMMANDS[method];
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="hidden md:block max-w-2xl mx-auto px-6">
            <div className="glass-card overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="ml-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <Terminal size={12} />
                            <span>Pasang via Terminal</span>
                        </div>
                    </div>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        {(['curl', 'bun', 'npm', 'yarn'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 ${method === m
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {m.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-8 font-mono text-sm relative group">
                    <div className="flex items-center gap-4 text-gray-400">
                        <span className="text-blue-500 shrink-0 select-none">❯</span>
                        <code className="break-all">{COMMANDS[method]}</code>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 active:scale-90"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-50">
                <span>Ringan: ~2MB</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>Instan: Shorthand Commands</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>Aman: Sandboxed</span>
            </div>
        </div>
    );
};
