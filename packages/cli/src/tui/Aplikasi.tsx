import React, { useState, useCallback, useRef } from 'react';
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

interface SessionStats {
    startTime: number;
    menuVisits: number;
    screensViewed: string[];
}

export const Aplikasi: React.FC<AplikasiProps> = ({ konteks, versi }) => {
    const { exit } = useApp();
    const [layar, setLayar] = useState<Layar>('selamat');
    const [pesan, setPesan] = useState<{ jenis: 'sukses' | 'info'; judul: string } | null>(null);
    const [aksiTerakhir, setAksiTerakhir] = useState<string | undefined>();
    const [exitAttempts, setExitAttempts] = useState(0);

    // Session tracking
    const sessionStats = useRef<SessionStats>({
        startTime: Date.now(),
        menuVisits: 0,
        screensViewed: []
    });

    const keMenu = useCallback(() => {
        sessionStats.current.menuVisits++;
        setLayar('menu');
    }, []);

    // Track screen views
    React.useEffect(() => {
        if (layar !== 'selamat' && !sessionStats.current.screensViewed.includes(layar)) {
            sessionStats.current.screensViewed.push(layar);
        }
    }, [layar]);

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
                showSessionSummaryAndExit();
                break;
            default:
                setPesan({ jenis: 'info', judul: `Fitur "${aksi}" akan segera hadir di versi TUI berikutnya.` });
                setLayar('pesan');
                break;
        }
    }, []);

    const showSessionSummaryAndExit = () => {
        const duration = Math.floor((Date.now() - sessionStats.current.startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const screens = sessionStats.current.screensViewed.join(', ') || 'Menu Utama';

        console.log('\n╭─────────────────────────────────────────────────────────────────╮');
        console.log('│  📊 Session Summary                                             │');
        console.log('├─────────────────────────────────────────────────────────────────┤');
        console.log(`│  Duration:    ${String(minutes).padStart(2)}m ${String(seconds).padStart(2)}s${' '.repeat(35)}│`);
        console.log(`│  Menu Visits: ${String(sessionStats.current.menuVisits).padStart(2)}${' '.repeat(48)}│`);
        console.log(`│  Screens:     ${screens.substring(0, 42).padEnd(42)}│`);
        console.log('├─────────────────────────────────────────────────────────────────┤');
        console.log('│  💡 Tip: Gunakan "lembaran cari" untuk mencari catatan lama    │');
        console.log('╰─────────────────────────────────────────────────────────────────╯');
        console.log('\n👋 Sampai jumpa di lain waktu!\n');
        exit();
    };

    // Global exit handler with double-verify and info
    useInput((input, key) => {
        // Check for exit keys (Ctrl+C, Q, Esc)
        const isExitKey = (key.ctrl && input === 'c') || input === 'q' || key.escape;

        if (isExitKey) {
            if (exitAttempts === 0) {
                // First attempt - show warning with info
                setExitAttempts(1);
                setPesan({
                    jenis: 'info',
                    judul: '⚠️  Tekan sekali lagi untuk keluar (atau tunggu 3 detik)'
                });

                // Show exit info after 1 second
                setTimeout(() => {
                    console.log('\n╭─────────────────────────────────────────────────────────────────╮');
                    console.log('│  ℹ️  Exit Info                                                   │');
                    console.log('├─────────────────────────────────────────────────────────────────┤');
                    console.log('│  • Tekan Ctrl+C / Q / Esc sekali lagi untuk keluar             │');
                    console.log('│  • Atau tunggu 3 detik untuk membatalkan                       │');
                    console.log('│  • Session summary akan ditampilkan setelah keluar             │');
                    console.log('╰─────────────────────────────────────────────────────────────────╯\n');
                }, 1000);

                // Auto-reset after 3 seconds
                setTimeout(() => {
                    setExitAttempts(0);
                    setPesan(null);
                }, 3000);
            } else {
                // Second attempt - show session summary and exit
                showSessionSummaryAndExit();
            }
            return;
        }

        // Handle message screen dismissal
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
