import { Arsip } from '../Arsip';

async function run() {
    const password = 'bolt-speed-test';
    await Arsip.unlockVault(password);

    console.log('Benchmarking getAllNotes (10 runs)...');
    const times = [];
    for (let i = 0; i < 10; i++) {
        const start = performance.now();
        const _notes = await Arsip.getAllNotes();
        const end = performance.now();
        times.push(end - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average time for 1000 notes: ${avg.toFixed(2)}ms`);
    process.exit(0);
}

run().catch(console.error);
