/**
 * Sentinel Sovereign: Background Security Manager
 * Implementation of Automated Security Monitoring & Reporting
 */
import { Integritas } from './Integritas';
import { Note } from './Rumus';

import { Brankas } from './Brankas';

export class Sentinel {
    private static auditHistory: string[] = [];

    /**
     * Memverifikasi integritas seluruh catatan secara berkala.
     */
    static async periksaIntegritas(notes: Note[]): Promise<{ invalidIds: string[] }> {
        const invalidIds: string[] = [];
        for (const note of notes) {
            const actualHash = await Integritas.hitungHash(note);
            if (note._hash && !Integritas.amanBandingkan(note._hash, actualHash)) {
                invalidIds.push(note.id);
                this.laporkan('INTEGRITY_VIOLATION', `ID: ${note.id}`);
            }
        }
        return { invalidIds };
    }

    /**
     * Melaporkan insiden keamanan secara otonom.
     * Mencatat ke file log audit lokal dan menyiapkan transmisi jika tersedia.
     */
    static async laporkan(tipe: string, pesan: string) {
        // Auto-Lock Defense: Clear keys if critical integrity violation detected
        if (tipe === 'INTEGRITY_VIOLATION' || tipe === 'DECRYPTION_FAILED') {
            Brankas.clearKey();
            console.warn('⚠️ SENTINEL: Critical anomaly detected. Vault LOCKED automatically.');
        }

        const insiden = `[${new Date().toISOString()}] [${tipe}] ${pesan}\n`;
        this.auditHistory.push(insiden.trim());

        if (typeof window === 'undefined') {
            try {
                const fs = await import('node:fs/promises');
                const path = await import('node:path');
                const logPath = path.resolve(process.cwd(), '.lembaran-audit.log');
                // Persistent Audit Log (Local-Only)
                await fs.appendFile(logPath, insiden, { mode: 0o600 });
            } catch (e) {
                // Ignore in browser-like environments
            }
        }

        // Reduced information leakage in console logs
        console.error(`🚨 SENTINEL ALERT: [${tipe}]`);
    }

    /**
     * Membaca log audit terbaru (Hanya untuk CLI/Server).
     */
    static async bacaLogAudit(): Promise<string[]> {
        if (typeof window !== 'undefined') return [];
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            const logPath = path.resolve(process.cwd(), '.lembaran-audit.log');
            const data = await fs.readFile(logPath, 'utf-8');
            return data.trim().split('\n').reverse();
        } catch (e) {
            return [];
        }
    }

    static getHistory() {
        return [...this.auditHistory];
    }
}
