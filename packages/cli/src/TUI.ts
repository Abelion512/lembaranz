import { Arsip, Gudang, Pujangga, Waktu, Rumus } from '@lembaran/core';
import pc from 'picocolors';
import prompts from 'prompts';

export class TUI {
    static async jalankan() {
        console.clear();
        console.log(pc.blue(pc.bold('=== LEMBARAN CLI v2.4.0 ===')));

        const isInit = await Arsip.isVaultInitialized();
        if (!isInit) {
            await this.inisialisasiBrankas();
        } else {
            await this.menuUtama();
        }
    }

    private static async inisialisasiBrankas() {
        console.log(pc.yellow('⚠️ Brankas belum terinisialisasi.'));
        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Buat kata sandi baru untuk brankas Anda:'
        });
        if (!res.pw) return;

        await Arsip.initializeVault(res.pw);
        console.log(pc.green('✅ Brankas berhasil dibuat!'));
        await this.menuUtama();
    }

    private static async menuUtama() {
        const res = await prompts({
            type: 'select',
            name: 'aksi',
            message: 'Apa yang ingin Anda lakukan?',
            choices: [
                { title: '📝 Tulis Catatan Baru', value: 'tulis' },
                { title: '📂 Lihat Arsip', value: 'lihat' },
                { title: '⚙️  Status Sistem', value: 'status' },
                { title: '🚪 Keluar', value: 'keluar' }
            ]
        });

        switch (res.aksi) {
            case 'tulis': await this.tulisCatatan(); break;
            case 'lihat': await this.lihatArsip(); break;
            case 'status':
                console.log(pc.cyan('ℹ️  Sistem berjalan normal.'));
                await this.menuUtama();
                break;
            default: process.exit(0);
        }
    }

    private static async tulisCatatan() {
        const res = await prompts([
            { type: 'text', name: 'judul', message: 'Judul (biarkan kosong untuk auto-title):' },
            { type: 'text', name: 'konten', message: 'Isi catatan:' }
        ]);

        if (!res.konten) return this.menuUtama();

        await Arsip.saveNote({
            title: res.judul || 'Tanpa Judul',
            content: res.konten,
            folderId: 'root'
        } as any);

        console.log(pc.green('✅ Catatan tersimpan dengan aman (terenkripsi).'));
        await this.menuUtama();
    }

    private static async lihatArsip() {
        const notes = await Arsip.getAllNotes();
        if (notes.length === 0) {
            console.log(pc.dim('Arsip kosong.'));
        } else {
            notes.forEach(n => console.log(`- ${pc.bold(n.title)} (${n.id})`));
        }
        await this.menuUtama();
    }
}
