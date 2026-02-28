import { Arsip, Gudang } from '@lembaran/core';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function testTamper() {
    const sakuPath = path.join(os.homedir(), '.lembaran', 'saku.json');
    const bakPath = path.join(os.homedir(), '.lembaran', 'saku.bak');
    try {
        // 1. Restore from bak
        const rawBak = await fs.readFile(bakPath, 'utf8');
        const saku = JSON.parse(rawBak);

        // 2. Tamper the first note's title base64 part
        const firstId = Object.keys(saku.notes)[0];
        let oldT = saku.notes[firstId].title;
        let parts = oldT.split('|');
        // change the 2nd char of base64
        let b64 = parts[1];
        let newB64 = b64.substring(0, 1) + (b64.charAt(1) === 'A' ? 'B' : 'A') + b64.substring(2);
        saku.notes[firstId].title = parts[0] + '|' + newB64;

        // 3. Write back to saku.json
        await fs.writeFile(sakuPath, JSON.stringify(saku), 'utf8');
        console.log("Saku.json berhasil diracun secara brutal di tengah Payload Base64.");

        // 4. Test loading
        await Gudang.inisialisasi(sakuPath);
        const unlocked = await Arsip.unlockVault('rahasia123');

        if (unlocked) {
            const notes = await Arsip.getAllNotes();
            console.log("\n--- Hasil Dekripsi ---");
            notes.forEach((n, i) => console.log(`${i + 1}. ${n.title}`));

            if (notes[0].title.includes('DATA RUSAK')) {
                console.log("\n✅ SUKSES (WH): Sistem Lembaran menolak mendekripsi cipher yang rusak.");
            } else {
                console.log("\n❌ GAGAL: Dekripsi masih bisa tembus!");
            }
        }

    } catch (e: any) {
        console.error(e);
    } finally {
        // Restore
        const rawBak = await fs.readFile(bakPath, 'utf8');
        await fs.writeFile(sakuPath, rawBak, 'utf8');
    }
}
testTamper();
