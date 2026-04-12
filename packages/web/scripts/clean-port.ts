/**
 * clean-port.ts
 * MemcleanPort proses yang mengandalkan port tertentu sebelum dev server dijalankan.
 * Kompatibel dengan Windows, macOS, dan Linux.
 */

const PORT = 1400;

async function cleanPort(port: number) {
    const { execSync } = await import('child_process');
    const isWindows = process.platform === 'win32';

    try {
        if (isWindows) {
            // Cari PID yang memakai port
            const output = execSync(
                `netstat -ano | findstr :${port}`,
                { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
            );

            const pids = new Set<string>();
            for (const line of output.split('\n')) {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) pids.add(match[1]);
            }

            for (const pid of pids) {
                try {
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                    console.log(`✅ Port ${port}: Proses PID ${pid} dihentikan.`);
                } catch {
                    // Proses mungkin sudah tidak ada
                }
            }

            if (pids.size === 0) {
                console.log(`ℹ️  Port ${port} sudah kosong.`);
            }
        } else {
            // macOS / Linux
            try {
                const output = execSync(
                    `lsof -ti tcp:${port}`,
                    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
                ).trim();

                if (output) {
                    execSync(`kill -9 ${output.split('\n').join(' ')}`, { stdio: 'ignore' });
                    console.log(`✅ Port ${port}: Proses dihentikan.`);
                } else {
                    console.log(`ℹ️  Port ${port} sudah kosong.`);
                }
            } catch {
                console.log(`ℹ️  Port ${port} sudah kosong.`);
            }
        }
    } catch {
        // Port tidak dipakai, lanjut saja
        console.log(`ℹ️  Port ${port} sudah kosong.`);
    }
}

await cleanPort(PORT);

export { };
