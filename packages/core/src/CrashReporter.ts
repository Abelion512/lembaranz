import { AuditLog } from './AuditLog';

export class CrashReporter {
    private static installed = false;

    /**
     * Memasang pendengar (listener) global untuk menangkap crash aplikasi.
     * Sangat disarankan untuk dipanggil sekali di root aplikasi (misalnya Layout Next.js atau Main CLI).
     */
    static pasang() {
        if (this.installed) return;

        // Lingkungan Browser
        if (typeof window !== 'undefined') {
            window.addEventListener('error', async (event) => {
                const message = `[FATAL BROWSER CRASH] ${event.message}`;
                const stack = event.error?.stack || 'Tanpa stack trace';

                await AuditLog.log('KESALAHAN', `${message}\nTrace:\n${stack}`);
            });

            window.addEventListener('unhandledrejection', async (event) => {
                const reason = event.reason instanceof Error ? event.reason.stack : String(event.reason);
                await AuditLog.log('KESALAHAN', `[UNHANDLED PROMISE REJECTION]\nAlasan:\n${reason}`);
            });
        }

        // Lingkungan Node (CLI/Server RSC)
        if (typeof process !== 'undefined') {
            process.on('uncaughtException', (error) => {
                AuditLog.log('KESALAHAN', `[FATAL NODE CRASH] Uncaught Exception\nTrace:\n${error.stack}`).catch(console.error);
            });

            process.on('unhandledRejection', (reason) => {
                const r = reason instanceof Error ? reason.stack : String(reason);
                AuditLog.log('KESALAHAN', `[FATAL NODE CRASH] Unhandled Rejection\nAlasan:\n${r}`).catch(console.error);
            });
        }

        this.installed = true;

        // Initial initialization log
        AuditLog.log('INFO', 'Crash Reporter Lembaran diaktifkan.').catch(() => {});
    }
}
