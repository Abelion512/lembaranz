import React, { useState, useCallback } from 'react';
import { Box, useApp, useInput } from 'ink';
import { BarStatus } from './BarStatus.js';
import { LayarSelamat } from './LayarSelamat.js';
import { MenuUtama } from './MenuUtama.js';
import { LayarPantau } from './LayarPantau.js';
import { LayarKeamanan } from './LayarKeamanan.js';
import { KotakPesan } from './KotakPesan.js';

import { LayarArsip } from './LayarArsip.js';
import { LayarUkir } from './LayarUkir.js';
import { LayarKredensial } from './LayarKredensial.js';

type Layar = 'selamat' | 'menu' | 'pantau' | 'keamanan' | 'pesan' | 'jelajah' | 'ukir' | 'kredensial';

interface AplikasiProps {
    konteks: string;
    versi: string;
}

export const Aplikasi: React.FC<AplikasiProps> = ({ konteks, versi }) => {
    const { exit } = useApp();
    const [layar, setLayar] = useState<Layar>('selamat');
    const [pesan, setPesan] = useState<{ jenis: 'sukses' | 'info'; judul: string } | null>(null);
    const [aksiTerakhir, setAksiTerakhir] = useState<string | undefined>();

    const keMenu = useCallback(() => setLayar('menu'), []);

    const handlePilih = useCallback((aksi: string) => {
        setAksiTerakhir(aksi);
        switch (aksi) {
            case 'pantau':
                setLayar('pantau');
                break;
            case 'jelajah':
                setLayar('jelajah');
                break;
            case 'ukir':
                setLayar('ukir');
                break;
            case 'kredensial':
                setLayar('kredensial');
                break;
            case 'audit_keamanan':
                setLayar('keamanan');
                break;
            case 'pengaturan':
                setPesan({ jenis: 'info', judul: 'Gunakan perintah `lembaran pengaturan` untuk manajemen .env yang lebih mendalam.' });
                setLayar('pesan');
                break;
            case 'keluar':
                exit();
                break;
            default:
                setPesan({ jenis: 'info', judul: `Fitur "${aksi}" akan segera hadir di versi TUI berikutnya.` });
                setLayar('pesan');
                break;
        }
    }, [exit]);

    useInput((input, key) => {
        if (layar === 'pesan' && (input === 'q' || key.escape || key.return)) {
            keMenu();
        }
    });

    const renderLayar = () => {
        switch (layar) {
            case 'selamat':
                return <LayarSelamat konteks={konteks} versi={versi} onSelesai={keMenu} />;
            case 'menu':
                return <MenuUtama onPilih={handlePilih} aksiAwal={aksiTerakhir} />;
            case 'pantau':
                return <LayarPantau konteks={konteks} onKembali={keMenu} />;
            case 'jelajah':
                return <LayarArsip onKembali={keMenu} />;
            case 'ukir':
                return <LayarUkir onKembali={keMenu} />;
            case 'kredensial':
                return <LayarKredensial onKembali={keMenu} />;
            case 'keamanan':
                return <LayarKeamanan onKembali={keMenu} />;
            case 'pesan':
                return (
                    <Box flexDirection="column" padding={1}>
                        {pesan && <KotakPesan jenis={pesan.jenis} judul={pesan.judul} isi="Tekan [Enter] atau [q] untuk kembali ke menu." />}
                    </Box>
                );
            default:
                return <MenuUtama onPilih={handlePilih} aksiAwal={aksiTerakhir} />;
        }
    };

    const namaLayar = {
        selamat: 'Selamat Datang',
        menu: 'Menu Utama',
        pantau: 'Status',
        jelajah: 'Arsip',
        ukir: 'Ukir',
        kredensial: 'Kredensial',
        keamanan: 'Keamanan',
        pesan: 'Info',
    }[layar] || 'Menu Utama';

    return (
        <Box flexDirection="column" key="aplikasi-root">
            <Box flexDirection="column" marginBottom={1} key="aplikasi-content">
                {renderLayar()}
            </Box>
            <BarStatus konteks={konteks} versi={versi} layar={namaLayar} />
        </Box>
    );
};
