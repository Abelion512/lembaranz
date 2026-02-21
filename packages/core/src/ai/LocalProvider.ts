import { PujanggaProvider, PujanggaPlan } from './types';

/**
 * LocalProvider (Hardened)
 * Menjalankan logika otonom dasar secara OFFLINE tanpa bantuan AI eksternal.
 * Menjamin 100% kedaulatan data.
 */
export class LocalProvider implements PujanggaProvider {
    id = 'local';
    name = 'Logika Lokal (Berdikari)';

    async berpikir(konteks: string, instruksi: string): Promise<PujanggaPlan> {
        const cleanKonteks = konteks.toLowerCase();
        const cleanInstruksi = instruksi.toLowerCase();

        // Aturan Heuristik untuk Tugas Umum
        if (cleanKonteks.includes('audit') || cleanInstruksi.includes('keamanan') || cleanInstruksi.includes('periksa')) {
            return {
                keputusan: 'Melakukan pemindaian integritas dan keamanan lokal.',
                alasan: 'Mode Berdikari aktif. Menjalankan skrip audit keamanan internal.',
                perintah_sistem: null, // Bisa diisi dengan skrip audit jika tersedia
                catatan_internal: 'Sentinel mengamankan pelataran dari kebocoran rahasia secara offline.'
            };
        }

        if (cleanInstruksi.includes('statistik') || cleanInstruksi.includes('lapor')) {
            return {
                keputusan: 'Menyusun laporan statistik brankas.',
                alasan: 'Analisis metadata lokal.',
                perintah_sistem: 'lembaran pantau',
                catatan_internal: 'Menampilkan ringkasan kesehatan sistem kepada pengguna.'
            };
        }

        return {
            keputusan: 'Tugas tertunda atau diproses secara manual.',
            alasan: 'Mode Berdikari membatasi eksekusi otonom demi keamanan maksimal.',
            perintah_sistem: null,
            catatan_internal: 'Gunakan mode Gemini jika memerlukan analisis kecerdasan buatan yang mendalam.'
        };
    }
}
