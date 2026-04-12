import { AuditLog } from './AuditLog';

export class CrashReporter {
    private static terpasang = false;

    /**
     * Memasang pendengar (listener) global untuk menangkap crash aplikasi.
     * Sangat disarankan untuk dipanggil sekali di root aplikasi (misalnya Layout Next.js atau Main CLI).
     */
    static pasang() {
        if (this.terpasang) return;

        // Lingkungan Browser
        if (typeof window !== 'undefined') {
            window.addEventListener('error', async (event) => {
                const message = `[FATAL BROWSER CRASH] ${event.message}`;
                const stack = event.error?.stack || 'Tanpa stack trace';

                await AuditLog.catat('KESALAHAN', `${message}\nTrace:\n${stack}`);
            });

            window.addEventListener('unhandledrejection', async (event) => {
                const reason = event.reason instanceof Error ? event.reason.stack : String(event.reason);
                await AuditLog.catat('KESALAHAN', `[UNHANDLED PROMISE REJECTION]\nAlasan:\n${reason}`);
            });
        }

        // Lingkungan Node (CLI/Server RSC)
        if (typeof process !== 'undefined') {
            process.on('uncaughtException', (error) => {
                AuditLog.catat('KESALAHAN', `[FATAL NODE CRASH] Uncaught Exception\nTrace:\n${error.stack}`).catch(console.error);
            });

            process.on('unhandledRejection', (reason) => {
                const r = reason instanceof Error ? reason.stack : String(reason);
                AuditLog.catat('KESALAHAN', `[FATAL NODE CRASH] Unhandled Rejection\nAlasan:\n${r}`).catch(console.error);
            });
        }

        this.terpasang = true;

        // Initial initialization log
        AuditLog.catat('INFO', 'Crash Reporter Lembaran diaktifkan.').catch(() => {});
    }
}
