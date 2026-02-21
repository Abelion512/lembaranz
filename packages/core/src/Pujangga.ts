import { PujanggaProvider, PujanggaPlan } from './ai/types';
import { GeminiProvider } from './ai/GeminiProvider';
import { LocalProvider } from './ai/LocalProvider';
import { PenyaringRahasia } from './ai/PenyaringRahasia';
import { AuditLog } from './AuditLog';

/**
 * Pujangga Engine: Modular & Private AI Architecture.
 * Standardized as a class for maximum compatibility.
 */
export class Pujangga {
    static _provider: PujanggaProvider = new LocalProvider();

    /**
     * Sets the active AI provider.
     */
    static setProvider(type: 'gemini' | 'openai' | 'claude' | 'none') {
        switch (type) {
            case 'gemini': this._provider = new GeminiProvider(); break;
            case 'none': this._provider = new LocalProvider(); break;
            default: this._provider = new LocalProvider();
        }
    }

    /**
     * Smart Brain with Privacy Scrubbing.
     */
    static async berpikir(konteks: string, instruksi: string): Promise<PujanggaPlan> {
        // Step 1: Scrub Secrets
        const safeKonteks = PenyaringRahasia.saring(konteks);
        const safeInstruksi = PenyaringRahasia.saring(instruksi);

        // Step 2: Laporan Transparansi (Audit)
        await AuditLog.catat('PERMINTAAN_KECERDASAN', {
            model: this._provider.name,
            konteks: safeKonteks,
            instruksi: safeInstruksi
        });

        // Step 3: Delegate to Provider
        const plan = await this._provider.berpikir(safeKonteks, safeInstruksi);

        // Step 4: Catat Keputusan
        await AuditLog.catat('KEPUTUSAN_SENTINEL', plan);

        return plan;
    }

    /**
     * Heuristic methods.
     */
    static async sarankanTag(konten: string): Promise<string[]> {
        const clean = konten.toLowerCase();
        const tags: string[] = [];
        if (clean.includes('koding') || clean.includes('bug')) tags.push('Developer');
        return tags;
    }

    static async sarankanJudul(konten: string): Promise<string> {
        return konten.substring(0, 30);
    }

    static async ringkasCerdas(konten: string): Promise<string> {
        return konten.substring(0, 150);
    }
}
