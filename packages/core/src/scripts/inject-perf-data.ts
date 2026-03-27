import { Arsip } from '../Arsip';

async function run() {
    const password = 'bolt-speed-test';
    const isInitialized = await Arsip.isVaultInitialized();

    if (!isInitialized) {
        console.log('Initializing vault...');
        await Arsip.setupVault(password);
    } else {
        console.log('Unlocking vault...');
        const success = await Arsip.unlockVault(password);
        if (!success) {
            console.error('Failed to unlock vault. Please clear .lembaran-db.json if you forgot the password.');
            process.exit(1);
        }
    }

    console.log('Injecting 1000 notes...');
    const startTime = Date.now();

    // Use for loop for sequential injection to avoid potential race conditions in simple FileAdapter
    for (let i = 1; i <= 1000; i++) {
        await Arsip.saveNote({
            title: `Note Performance Test #${i}`,
            content: `Ini adalah catatan ke-${i} untuk pengujian performa Bolt ⚡.
                     Catatan ini berisi teks yang cukup panjang untuk mensimulasikan beban kerja nyata.
                     Pujangga akan membantu membuatkan ringkasan cerdas dari konten ini.
                     Kita akan mencari kata kunci "BOLT_SPECIAL_TOKEN" di beberapa catatan.` +
                (i === 500 || i === 999 ? ' BOLT_SPECIAL_TOKEN' : ''),
            folderId: null,
            isPinned: i % 10 === 0,
            isFavorite: false,
            tags: ['Performance', 'Bolt', i % 2 === 0 ? 'Testing' : 'Benchmark']
        });

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
