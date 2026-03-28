'use client';

import React, { useState } from 'react';
import {
    User, Lock, Link as LinkIcon, Copy, Check, Sparkles, Wand2,
    Settings2, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { haptic } from '@lembaran/core/Indera';

interface KredensialData {
    username?: string;
    password?: string;
    url?: string;
}

interface PenyusunKredensialProps {
    data: KredensialData;
    onChange: (data: KredensialData) => void;
}

export const PenyusunKredensial = ({ data, onChange }: PenyusunKredensialProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isPasting, setIsPasting] = useState(false);
    const [showPassGen, setShowPassGen] = useState(false);
    const [genLength, setGenLength] = useState(16);

    const getPasswordStrength = (p: string) => {
        if (!p) return 0;
        let score = 0;
        if (p.length > 8) score++;
        if (p.length > 12) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const strength = getPasswordStrength(data.password || "");

    const updateField = (field: keyof KredensialData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handleCopy = (text: string | undefined, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        haptic.success();
        setTimeout(() => setCopiedField(null), 2000);
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        const randomValues = new Uint32Array(genLength);
        window.crypto.getRandomValues(randomValues);
        let result = "";
        for (let i = 0; i < genLength; i++) {
            result += chars.charAt(randomValues[i] % chars.length);
        }
        updateField('password', result);
        setShowPassword(true);
        haptic.medium();
    };

    const handleSmartPaste = async () => {
        setIsPasting(true);
        haptic.medium();
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            const newData: KredensialData = { ...data };
            const userMatch = text.match(/(?:username|user|email|id|pengguna):\s*([^\n\r,]+)/i);
            const passMatch = text.match(/(?:password|pass|sandi|pwd):\s*([^\n\r,]+)/i);
            const urlMatch = text.match(/(?:url|link|site|tautan):\s*([^\n\r\s,]+)/i);

            if (userMatch) newData.username = userMatch[1].trim();
            if (passMatch) newData.password = passMatch[1].trim();
            if (urlMatch) newData.url = urlMatch[1].trim();

            onChange(newData);
            haptic.success();
        } catch (_err) {
            // Diabaikan: kegagalan paste bersifat non-kritis
        } finally {
            setTimeout(() => setIsPasting(false), 500);
        }
    };

    const inputClass = "flex-1 bg-transparent border-none focus:outline-none text-[13px] sm:text-[14px] py-1 placeholder:opacity-30 min-w-0";

    return (
        <div className="space-y-2 mb-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50 flex items-center gap-1.5">
                    <Sparkles size={10} /> Kredensial
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPassGen(!showPassGen)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${showPassGen ? 'bg-blue-500 text-white border-blue-500' : 'border-blue-500/20 text-blue-500 hover:bg-blue-500/5'} transition-all`}
                    >
                        <Settings2 size={10} /> Pembangkit
                    </button>
                    <button
                        onClick={handleSmartPaste}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-500/20 text-blue-500 hover:bg-blue-500/5 transition-all ${isPasting ? 'animate-pulse' : ''}`}
                    >
                        <Wand2 size={10} /> Tempel Pintar
                    </button>
                </div>
            </div>

            {showPassGen && (
                <div className="mx-1 p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[9px] font-black uppercase text-blue-500/60">Panjang: {genLength}</span>
                        <input
                            type="range" min="8" max="32" value={genLength}
                            onChange={(e) => setGenLength(parseInt(e.target.value))}
                            className="w-full h-1 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <button onClick={generatePassword} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                        <RefreshCw size={12} /> Acak
                    </button>
                </div>
            )}

            <div className="ios-list-group border border-[var(--separator)]/20 shadow-sm overflow-hidden w-full mb-0">
                <div className="flex items-center px-3 gap-2 group">
                    <User size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input type="text" value={data.username || ''} onChange={(e) => updateField('username', e.target.value)} placeholder="Username / Email" className={inputClass} />
                    <button onClick={() => handleCopy(data.username, 'user')} className="p-1.5 opacity-20 hover:opacity-100 transition-opacity text-blue-500">{copiedField === 'user' ? <Check size={14} /> : <Copy size={14} />}</button>
                </div>
                <div className="ios-separator"></div>

                <div className="flex flex-col">
                    <div className="flex items-center px-3 gap-2 group">
                        <Lock size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input type={showPassword ? "text" : "password"} value={data.password || ''} onChange={(e) => updateField('password', e.target.value)} placeholder="Password" className={inputClass} />
                        <button onClick={() => setShowPassword(!showPassword)} className="p-1.5 opacity-20 hover:opacity-100 transition-opacity">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        <button onClick={() => handleCopy(data.password, 'pass')} className="p-1.5 opacity-20 hover:opacity-100 transition-opacity text-blue-500">{copiedField === 'pass' ? <Check size={14} /> : <Copy size={14} />}</button>
                    </div>
                    {data.password && (
                        <div className="px-10 pb-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= strength ? (strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-yellow-500" : "bg-green-500") : "bg-white/5"}`} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="ios-separator"></div>

                <div className="flex items-center px-3 gap-2 group">
                    <LinkIcon size={15} className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <input type="text" value={data.url || ''} onChange={(e) => updateField('url', e.target.value)} placeholder="URL" className={inputClass} />
                    <button onClick={() => handleCopy(data.url, 'url')} className="p-1.5 opacity-20 hover:opacity-100 transition-opacity text-blue-500">{copiedField === 'url' ? <Check size={14} /> : <Copy size={14} />}</button>
                </div>
            </div>
        </div>
    );
};
