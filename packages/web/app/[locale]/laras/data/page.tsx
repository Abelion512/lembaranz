'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Upload, Shield, Trash2 } from 'lucide-react';
import { Arsip } from '@lembaran/core/Arsip';
import { Brankas } from '@lembaran/core/Brankas';
import { haptic } from '@lembaran/core/Indera';
import { saveAs } from 'file-saver';

export default function DataLarasPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [_deadLinks, setDeadLinks] = useState<number | null>(null);

    const handleExportVault = async () => {
        setIsExporting(true);
        try {
            const rawNotes = await Arsip.getAllNotes();
            const dataStr = JSON.stringify(rawNotes);
            const encryptedData = await Brankas.encryptPacked(dataStr);
            const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
            saveAs(blob, `lembaran-encrypted-vault-${new Date().toISOString().split('T')[0]}.lembaran`);
            haptic.success();
        } catch (_e) {
            console.error(_e);
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsExporting(true);
        try {
            let count = 0;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.md')) {
                    const content = await file.text();
                    await Arsip.saveNote({
                        id: crypto.randomUUID(),
                        title: file.name.replace('.md', ''),
                        content: content,
                        tags: ['import'],
                        folderId: null,
                        isPinned: false,
                        isFavorite: false,
                        createdAt: new Date().toISOString()
                    });
                    count++;
                }
            }
            alert(`Berhasil mengimpor ${count} catatan.`);
            haptic.success();
        } catch (_e) {
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    const handleCheckDeadLinks = async () => {
        setIsExporting(true);
        try {
            const notes = await Arsip.getAllNotes();
            const credentialNotes = notes.filter(n => n.isCredentials);
            let deadCount = 0;
            for (const note of credentialNotes) {
                const decrypted = await Arsip.decryptNote(note);
                const creds = decrypted.kredensial as Record<string, unknown>;
                const url = creds?.url;
                if (typeof url === 'string' && (url.includes('example.com') || url.includes('test.local'))) {
                    deadCount++;
                }
            }
            setDeadLinks(deadCount);
            haptic.success();
        } catch (_e) {
            haptic.error();
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-20">
            <Link href="/laras" className="flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit">
                <ChevronLeft size={24} />
                <span className="text-[17px]">Setelan</span>
            </Link>

            <h1 className="text-3xl font-bold tracking-tight mb-8">Data & Penyimpanan</h1>

            <div className="space-y-6">
                <div className="ios-list-group">
                    <button onClick={handleExportVault} disabled={isExporting} className="w-full ios-list-item">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                <Download size={18} />
                            </div>
                            <span className="font-semibold">Ekspor Vault (.lembaran)</span>
                        </div>
                    </button>
                    <div className="ios-separator"></div>
                    <label className="w-full ios-list-item cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                                <Upload size={18} />
                            </div>
                            <span className="font-semibold">Impor Markdown (.md)</span>
                        </div>
                        <input type="file" multiple accept=".md" onChange={handleImportMarkdown} className="hidden" />
                    </label>
                </div>

                <h2 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2.5 ml-4">Pemeliharaan</h2>
                <div className="ios-list-group">
                    <button onClick={handleCheckDeadLinks} className="w-full ios-list-item">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                <Shield size={18} />
                            </div>
                            <span className="font-semibold">Cek Link Mati (Credential)</span>
                        </div>
                    </button>
                    <div className="ios-separator"></div>
                    <button className="w-full ios-list-item text-red-500">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center">
                                <Trash2 size={18} />
                            </div>
                            <span className="font-bold">Hapus Semua Data</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
