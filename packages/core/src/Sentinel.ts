import { Laras } from './Laras';
import { Pujangga } from './Pujangga';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export type SentinelTask = {
    id: string;
    label: string;
    frequency: number; // in milliseconds
    action: () => Promise<void>;
    lastRun?: number;
};

export class Sentinel {
    private static tasks: Map<string, SentinelTask> = new Map();
    private static intervals: Map<string, any> = new Map();
    private static isRunning: boolean = false;
    private static isSovereignActive: boolean = false;

    /**
     * Executes a system command and returns the output.
     */
    static async eksekusi(perintah: string): Promise<{ stdout: string; stderr: string }> {
        console.log(`[SENTINEL EXEC] 🏃 Running: ${perintah}`);
        return await execAsync(perintah);
    }

    /**
     * Starts an autonomous goal-seeking loop.
     */
    static async siklusBerdaulat(tujuan: string) {
        if (this.isSovereignActive) return;
        this.isSovereignActive = true;

        console.log(`\n👑 SENTINEL SOVEREIGN: Tugas dimulai ❯ "${tujuan}"`);

        let attempts = 0;
        const maxAttempts = 3;

        while (this.isSovereignActive && attempts < maxAttempts) {
            attempts++;
            console.log(`\n🧠 Berpikir (Siklus ${attempts}/${maxAttempts})...`);

            try {
                const konteks = `Target: ${tujuan}\nUpaya saat ini: ${attempts}\nLokasi: ${process.cwd()}`;
                const instruksi = `Rencanakan langkah selanjutnya untuk mencapai target.`;

                const plan = await Pujangga.berpikir(konteks, instruksi);

                console.log(`🎯 Keputusan: ${plan.keputusan}`);
                console.log(`📝 Alasan: ${plan.alasan}`);

                if (plan.perintah_sistem) {
                    try {
                        const result = await this.eksekusi(plan.perintah_sistem);
                        console.log(`✅ Output: ${result.stdout.substring(0, 100)}...`);
                    } catch (execError: any) {
                        console.log(`⚠️  Eksekusi Gagal: ${execError.message}`);
                        console.log('🔍 Menganalisis alasan kegagalan...');
                        const analysis = await Pujangga.berpikir(
                            `Error: ${execError.message}\nCommand: ${plan.perintah_sistem}`,
                            'Berikan saran perbaikan atau perintah baru untuk menangani error ini.'
                        );
                        console.log(`💡 Saran Perbaikan: ${analysis.keputusan}`);
                        // Optionally retry or adjust
                    }
                }

                if (plan.keputusan.toLowerCase().includes('selesai') || plan.keputusan.toLowerCase().includes('berhasil')) {
                    console.log('✅ GOAL ACHIEVED: Sentinel Sovereign telah menyelesaikan misinya.');
                    break;
                }

            } catch (error) {
                console.error('❌ Sovereign Cycle Error:', error);
                break;
            }
        }

        this.isSovereignActive = false;
        console.log('🏁 Sovereign cycle ended.\n');
    }

    /**
     * Registers a new task to be executed periodically.
     */
    static daftarTugas(task: SentinelTask) {
        this.tasks.set(task.id, task);
        if (this.isRunning) {
            this.mulaiTugas(task);
        }
    }

    /**
     * Starts the Sentinel heartbeat and all registered tasks.
     */
    static async hidupkan() {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('📡 Sentinel: Denyut nadi diaktifkan.');

        for (const task of this.tasks.values()) {
            this.mulaiTugas(task);
        }
    }

    /**
     * Stops the Sentinel and clears all task intervals.
     */
    static matikan() {
        this.isRunning = false;
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        console.log('🛑 Sentinel: Denyut nadi dihentikan.');
    }

    private static mulaiTugas(task: SentinelTask) {
        if (this.intervals.has(task.id)) {
            clearInterval(this.intervals.get(task.id));
        }

        const interval = setInterval(async () => {
            if (!this.isRunning) return;
            try {
                await task.action();
                task.lastRun = Date.now();
            } catch (error) {
                console.error(`❌ Sentinel Group [${task.label}] error:`, error);
            }
        }, task.frequency);

        this.intervals.set(task.id, interval);

        // Immediate first run
        task.action().catch(e => console.error(e));
    }

    /**
     * Default system tasks for Sentinel.
     */
    static inisialisasiDefault() {
        // Task 1: Audit Integritas Pelataran (.env leak check)
        this.daftarTugas({
            id: 'audit-keamanan',
            label: 'Audit Keamanan Pelataran',
            frequency: 1000 * 60 * 60, // 1 hour
            action: async () => {
                const env = Laras.bacaEnv();
                const leaks = Object.keys(env).filter(k =>
                    k.toLowerCase().includes('key') ||
                    k.toLowerCase().includes('secret') ||
                    k.toLowerCase().includes('password')
                );

                if (leaks.length > 0) {
                    console.log(`[SENTINEL AUDIT] ⚠️  Terdeteksi ${leaks.length} rahasia terekspos di .env`);
                }
            }
        });

        // Task 2: Heartbeat log
        this.daftarTugas({
            id: 'heartbeat',
            label: 'Denyut Nadi',
            frequency: 1000 * 60 * 30, // 30 minutes
            action: async () => {
                console.log(`[SENTINEL] Pulse: ${new Date().toLocaleTimeString()} - Sistem Sehat.`);
            }
        });
    }
}
