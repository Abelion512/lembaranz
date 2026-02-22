import { describe, expect, it } from 'bun:test';
import { ambilKontenDok, normalisasiSlugDok } from './ambilKontenDok';

describe('normalisasiSlugDok', () => {
    it('menerima slug known tanpa toLowerCase', () => {
        expect(normalisasiSlugDok('MULAI_CEPAT')).toBe('MULAI_CEPAT');
        expect(normalisasiSlugDok('GETTING_STARTED')).toBe('GETTING_STARTED');
        expect(normalisasiSlugDok('cli')).toBe('cli');
    });

    it('menolak slug kosong setelah sanitasi', () => {
        expect(normalisasiSlugDok('')).toBeNull();
        expect(normalisasiSlugDok('   ')).toBeNull();
        expect(normalisasiSlugDok('...')).toBeNull();
    });

    it('menolak slug yang berubah terlalu ekstrem setelah sanitasi', () => {
        expect(normalisasiSlugDok('../../../../etc/passwd')).toBeNull();
        expect(normalisasiSlugDok('MULAI!!!__CEPAT')).toBeNull();
    });

    it('menolak slug yang tidak ada dalam mapping eksplisit', () => {
        expect(normalisasiSlugDok('mulai_cepat')).toBeNull();
        expect(normalisasiSlugDok('unknown')).toBeNull();
    });
});

describe('ambilKontenDok', () => {
    it('memetakan GETTING_STARTED ke file id yang benar saat fallback', async () => {
        const konten = await ambilKontenDok('GETTING_STARTED', 'id');
        expect(konten).not.toBeNull();
        expect(konten).toContain('Lembaran');
    });
});
