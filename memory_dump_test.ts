import { Arsip, Gudang, Brankas } from '@lembaran/core';
import os from 'node:os';
import path from 'node:path';
import v8 from 'node:v8';
import fs from 'node:fs/promises';

async function testMemoryDump() {
    console.log("1. Menginisialisasi Sistem...");
    const sakuPath = path.join(os.homedir(), '.lembaran', 'saku.json');
    await Gudang.inisialisasi(sakuPath);

    console.log("2. Membuka Brankas...");
    await Arsip.unlockVault('rahasia123');

    console.log("3. Mendekripsi Catatan ke Memori...");
    const notes = await Arsip.getAllNotes();
    const probeString = "rahasia123"; // String yang seharusnya tersirkulasi saat derivasi kunci

    // Tahan variabel di closure temporal
    const contentCheck = notes[0].title;
    console.log(`(Simulasi) Aplikasi membaca catatan: ${contentCheck}`);

    console.log("4. Mengunci Brankas & Memanggil Garbage Collector (V8)...");
    Brankas.clearKey();
    if (global.gc) {
        global.gc();
    }

    console.log("5. Mengeksekusi Memory Heap Dump...");
    const dumpFile = path.join(os.tmpdir(), `lembaran_dump_${Date.now()}.heapsnapshot`);
    v8.writeHeapSnapshot(dumpFile);
    console.log(`Heap Snapshot ditulis ke: ${dumpFile}`);

    console.log("6. Menganalisis File RAM Dump...");
    const rawDump = await fs.readFile(dumpFile, 'utf8');

    // Mencari jejak string sensitif dalam JSON dump V8
    const isProbeFound = rawDump.includes(probeString);
    const isNoteTitleFound = rawDump.includes(contentCheck);

    console.log("\n--- Laporan Analisis RAM ---");
    if (isProbeFound) {
        console.log(`⚠️ Katasandi master (${probeString}) ditemukan berkeliaran di RAM!`);
    } else {
        console.log(`✅ Katasandi master disapu bersih dari RAM (Argon2id Memory Hardness efektif).`);
    }

    if (isNoteTitleFound) {
        console.log(`⚠️ Plaintext Catatan ('${contentCheck}') masih membekas di RAM walau Brankas dikunci!`);
    } else {
        console.log(`✅ Plaintext Catatan disapu bersih oleh Garbage Collector.`);
    }

    // Cleanup
    await fs.unlink(dumpFile);
}

testMemoryDump();
