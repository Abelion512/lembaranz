'use client';

import React, { useState } from 'react';
import { Unlock, Key, Eye, EyeOff, Plus, Trash2, Search, Copy, LogOut, Shield, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Credential {
    id: string;
    title: string;
    username: string;
    password: string;
    tags: string[];
    createdAt: string;
}

type Screen = 'locked' | 'unlocking' | 'dashboard' | 'add';

const MOCK_CREDENTIALS: Credential[] = [
    { id: '1', title: 'GitHub API Key', username: 'abelion', password: 'ghp_4f8g2k9m3x7q1w5e', tags: ['api', 'github'], createdAt: '2026-04-14' },
    { id: '2', title: 'AWS Secret Key', username: 'AKIA5X7Y9Z', password: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY', tags: ['cloud', 'aws'], createdAt: '2026-04-13' },
    { id: '3', title: 'Database Password', username: 'admin', password: 'S3cur3P@ss!2026', tags: ['database', 'prod'], createdAt: '2026-04-12' },
];

export default function VaultGUI() {
    const [screen, setScreen] = useState<Screen>('locked');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState<Credential[]>(MOCK_CREDENTIALS);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPwdId, setShowPwdId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [newCredential, setNewCredential] = useState({ title: '', username: '', password: '', tags: '' });

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setScreen('unlocking');
        setTimeout(() => setScreen('dashboard'), 1200);
    };

    const handleLock = () => { setScreen('locked'); setPassword(''); setShowPwdId(null); };

    const handleAddCredential = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCredential.title || !newCredential.password) return;
        const cred: Credential = {
            id: Date.now().toString(),
            title: newCredential.title,
            username: newCredential.username,
            password: newCredential.password,
            tags: newCredential.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
            createdAt: new Date().toISOString().split('T')[0],
        };
        setCredentials(prev => [...prev, cred]);
        setNewCredential({ title: '', username: '', password: '', tags: '' });
        setScreen('dashboard');
    };

    const handleDelete = (id: string) => setCredentials(prev => prev.filter(c => c.id !== id));

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = credentials.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-950/20 via-transparent to-purple-950/20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <AnimatePresence mode="wait">
                {/* Lock Screen */}
                {screen === 'locked' && (
                    <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex items-center justify-center min-h-screen relative z-10">
                        <div className="w-full max-w-sm px-8">
                            <div className="text-center mb-10">
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl shadow-blue-500/10">
                                    <Fingerprint size={36} className="text-blue-400" />
                                </motion.div>
                                <h1 className="text-2xl font-bold mb-2 tracking-tight">Lembaranz Vault</h1>
                                <p className="text-zinc-500 text-sm">Self-hosted credential manager</p>
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-zinc-600">Local only • Zero-knowledge</span>
                                </div>
                            </div>

                            <form onSubmit={handleUnlock} className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Master password"
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all pr-12 group-hover:border-white/20"
                                        autoFocus
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                                    <Unlock size={16} /> Unlock Vault
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* Unlocking */}
                {screen === 'unlocking' && (
                    <motion.div key="unlocking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center min-h-screen relative z-10">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center animate-pulse">
                                <Key size={36} className="text-blue-400" />
                            </div>
                            <p className="text-zinc-500 text-sm">Decrypting vault...</p>
                        </motion.div>
                    </motion.div>
                )}

                {/* Dashboard */}
                {screen === 'dashboard' && (
                    <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        {/* Header */}
                        <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                    <Shield size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold">Vault</span>
                                    <span className="text-xs text-zinc-600 ml-2">{credentials.length} credentials</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setScreen('add')} className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Plus size={18} />
                                </button>
                                <button onClick={handleLock} className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </header>

                        <main className="max-w-2xl mx-auto px-6 py-6">
                            {/* Search */}
                            <div className="relative mb-6 group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search credentials..." className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all group-hover:border-white/20" />
                            </div>

                            {/* Credentials */}
                            <div className="space-y-2">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-20 text-zinc-600 text-sm">No credentials found</div>
                                ) : filtered.map(cred => (
                                    <motion.div key={cred.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium">{cred.title}</h3>
                                            <button onClick={() => handleDelete(cred.id)} className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                        </div>
                                        <p className="text-xs text-zinc-500 mb-3">{cred.username}</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <code className="text-xs font-mono text-zinc-400 flex-1 truncate bg-black/20 px-3 py-2 rounded-xl">
                                                {showPwdId === cred.id ? cred.password : cred.password.slice(0, 4) + '•'.repeat(Math.min(cred.password.length - 4, 12))}
                                            </code>
                                            <button onClick={() => setShowPwdId(showPwdId === cred.id ? null : cred.id)} className="p-2 text-zinc-600 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                                                {showPwdId === cred.id ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            <button onClick={() => handleCopy(cred.password, cred.id)} className="p-2 text-zinc-600 hover:text-white transition-colors hover:bg-white/5 rounded-xl relative">
                                                {copiedId === cred.id ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 text-[10px] font-bold">✓</motion.span> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {cred.tags.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 bg-white/5 text-zinc-500 text-[10px] rounded-full border border-white/5">{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </main>
                    </motion.div>
                )}

                {/* Add Credential */}
                {screen === 'add' && (
                    <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <header className="border-b border-white/5 px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl z-10">
                            <button onClick={() => setScreen('dashboard')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">←</button>
                            <span className="text-sm font-semibold">Add Credential</span>
                        </header>
                        <main className="max-w-md mx-auto px-6 py-8">
                            <form onSubmit={handleAddCredential} className="space-y-3">
                                <input type="text" value={newCredential.title} onChange={e => setNewCredential({ ...newCredential, title: e.target.value })} placeholder="Title" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" required />
                                <input type="text" value={newCredential.username} onChange={e => setNewCredential({ ...newCredential, username: e.target.value })} placeholder="Username / Email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
                                <input type="password" value={newCredential.password} onChange={e => setNewCredential({ ...newCredential, password: e.target.value })} placeholder="Password / Secret" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" required />
                                <input type="text" value={newCredential.tags} onChange={e => setNewCredential({ ...newCredential, tags: e.target.value })} placeholder="Tags (comma-separated)" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
                                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25">Save Credential</motion.button>
                            </form>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
