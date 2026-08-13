import { Context } from './Context';

/**
 * AuditLog (Privacy Report)
 * Records all Sentinel activity and AI processing for user transparency.
 * Decoupled from Node.js top-level imports to support browser builds.
 */
export class AuditLog {
    private static readonly LOG_FILE = 'audit-privasi.log';

    static async log(action: string, data: unknown) {
        if (typeof window !== 'undefined') return;

        try {
            // Dynamic imports for Node.js ESM environments
            const [fs, path] = await Promise.all([
                import('fs/promises'),
                import('path')
            ]);

            const targetFile = await Context.resolvePath('personal');
            const sakuDir = path.dirname(targetFile);
            const logPath = path.join(sakuDir, this.LOG_FILE);

            const entry = {
                timestamp: new Date().toISOString(),
                action,
                source: 'Sentinel Sovereign',
                processedData: data,
                privacyStatus: 'SCRUBBED'
            };

            await fs.appendFile(logPath, JSON.stringify(entry) + '\n', { mode: 0o600 });
        } catch (err) {
            console.error('Failed to write audit log:', err);
        }
    }

    static async readLog(): Promise<string> {
        if (typeof window !== 'undefined') return 'Audit log is only available in CLI/Desktop environment.';

        try {
            const [fs, path] = await Promise.all([
                import('fs/promises'),
                import('path')
            ]);

            const targetFile = await Context.resolvePath('personal');
            const sakuDir = path.dirname(targetFile);
            const logPath = path.join(sakuDir, this.LOG_FILE);

            return await fs.readFile(logPath, 'utf-8');
        } catch {
            return 'No privacy activity recorded yet.';
        }
    }
}
