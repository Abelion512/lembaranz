import { getBenchPassword } from './config';
import { Archive } from '../Archive';

async function run() {
    const password = getBenchPassword();
    const isInitialized = await Archive.isVaultInitialized();

    if (!isInitialized) {
        console.log('Initializing vault...');
        await Archive.setupVault(password);
    } else {
        console.log('Unlocking vault...');
        const success = await Archive.unlockVault(password);
        if (!success) {
            console.error('Failed to unlock vault. Please clear .lembaranz-db.json if you forgot the password.');
            process.exit(1);
        }
    }

    console.log('Injecting 1000 notes...');
    const startTime = Date.now();

    // Use for loop for sequential injection to avoid potential race conditions in simple FileAdapter
    for (let i = 1; i <= 1000; i++) {
        await Archive.saveNote({
            title: `Note Performance Test #${i}`,
            content: `This is note #${i} for Bolt performance testing ⚡.
                     This note contains fairly long text to simulate real workload.
                     Poet will help create a smart summary of this content.
                     We will search for the keyword "BOLT_SPECIAL_TOKEN" in several notes.` +
                (i === 500 || i === 999 ? ' BOLT_SPECIAL_TOKEN' : ''),
            folderId: null,
            isPinned: i % 10 === 0,
            isFavorite: false,
            tags: ['Performance', 'Bolt', i % 2 === 0 ? 'Testing' : 'Benchmark']
        } as any);

        if (i % 100 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            console.log(`${i} notes injected... (${elapsed.toFixed(1)}s)`);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Success! 1000 notes injected in ${totalTime.toFixed(1)}s.`);
    process.exit(0);
}

run().catch(err => {
    console.error('Error during injection:', err);
    process.exit(1);
});
