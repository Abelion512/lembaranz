import { getBenchPassword } from './config';
import { Archive } from '../Archive';

async function run() {
    const password = getBenchPassword();
    await Archive.unlockVault(password);

    console.log('Benchmarking getAllNotes (10 runs)...');
    const times = [];
    for (let i = 0; i < 10; i++) {
        const start = performance.now();
        const _notes = await Archive.getAllNotes();
        const end = performance.now();
        const duration = end - start;
        console.log(`Run #${i + 1}: ${duration.toFixed(2)}ms`);
        times.push(duration);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average time for 1000 notes: ${avg.toFixed(2)}ms`);
    process.exit(0);
}

run().catch(console.error);
