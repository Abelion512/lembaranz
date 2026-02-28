import { Arsip, Laras, Gudang } from '@lembaran/core';

async function run() {
    const ctx = await Laras.deteksiKonteksOtomatis();
    const jalur = await Laras.temukanJalur(ctx);
    await Gudang.inisialisasi(jalur);
    
    const isInit = await Arsip.isVaultInitialized();
    console.log("Diinisialisasi?", isInit, "Jalur:", jalur);
    
    if(!isInit) {
        await Arsip.setupVault("rahasia123");
        console.log("Brankas di-setup dengan sandi 'rahasia123'");
    }
}
run();
