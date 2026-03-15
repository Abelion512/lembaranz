import { Laras } from './Laras';

/**
 * AuditLog (Laporan Privasi)
 * Mencatat semua aktivitas Sentinel dan pemrosesan AI untuk transparansi pengguna.
 * Decoupled from Node.js top-level imports to support browser builds.
 */
export class AuditLog {
    private static readonly LOG_FILE = 'audit-privasi.log';

    static async catat(aksi: string, data: unknown) {
        if (typeof window !== 'undefined') return;

        try {
            // Dynamic imports for Node.js ESM environments
            const [fs, path] = await Promise.all([
                import('node:fs/promises'),
                import('node:path')
            ]);

            const sakuDir = (await Laras.temukanJalur('saku')).replace('saku.json', '');
            const logPath = path.join(sakuDir, this.LOG_FILE);

            const entri = {
                waktu: new Date().toISOString(),
                aksi,
                sumber: 'Sentinel Sovereign',
                data_terproses: data,
                status_privasi: 'TERARING (SCRUBBED)'
            };

            await fs.appendFile(logPath, JSON.stringify(entri) + '\n');
        } catch (err) {
            console.error('Gagal mencatat log audit:', err);
        }
    }

    static async bacaLog(): Promise<string> {
        if (typeof window !== 'undefined') return 'Log audit hanya tersedia di aplikasi Desktop.';

        try {
            const [fs, path] = await Promise.all([
                import('node:fs/promises'),
                import('node:path')
            ]);

            const sakuDir = (await Laras.temukanJalur('saku')).replace('saku.json', '');
            const logPath = path.join(sakuDir, this.LOG_FILE);

            return await fs.readFile(logPath, 'utf-8');
        } catch {
            return 'Belum ada catatan aktivitas privasi.';
        }
    }
}
