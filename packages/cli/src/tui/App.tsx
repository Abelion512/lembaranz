import React, { useState, useCallback, useRef } from 'react';
import { Box, useApp, useInput } from 'ink';
import { StatusBar } from './StatusBar.js';
import { WelcomeScreen } from './WelcomeScreen.js';
import { MainMenu } from './MainMenu.js';
import { MonitorScreen } from './MonitorScreen.js';
import { SecurityScreen } from './SecurityScreen.js';
import { MessageBox } from './MessageBox.js';

import { ArchiveScreen } from './ArchiveScreen.js';
import { CarveScreen } from './CarveScreen.js';
import { CredentialsScreen } from './CredentialsScreen.js';

type Layar = 'selamat' | 'menu' | 'monitor' | 'security' | 'message' | 'browse' | 'carve' | 'credentials';

interface AppProps {
    context: string;
    versi: string;
    initialScreen?: Layar;
    initialFilter?: string;
}

interface SessionStats {
    startTime: number;
    menuVisits: number;
    screensViewed: string[];
}

export const App: React.FC<AppProps> = ({ context, versi, initialScreen, initialFilter }) => {
    const { exit } = useApp();
    const [screen, setLayar] = useState<Layar>(initialScreen || 'selamat');
    const [message, setPesan] = useState<{ type: 'success' | 'info'; title: string } | null>(null);
    const [lastAction, setAksiTerakhir] = useState<string | undefined>();
    const [exitAttempts, setExitAttempts] = useState(0);

    // Session tracking
    const sessionStats = useRef<SessionStats>({
        startTime: Date.now(),
        menuVisits: 0,
        screensViewed: []
    });

    const goToMenu = useCallback(() => {
        sessionStats.current.menuVisits++;
        setLayar('menu');
    }, []);

    // Track screen views
    React.useEffect(() => {
        if (screen !== 'selamat' && !sessionStats.current.screensViewed.includes(screen)) {
            sessionStats.current.screensViewed.push(screen);
        }
    }, [screen]);

    const handleSelect = useCallback((aksi: string) => {
        setAksiTerakhir(aksi);
        switch (aksi) {
            case 'monitor':
                setLayar('monitor');
                break;
            case 'browse':
                setLayar('browse');
                break;
            case 'carve':
                setLayar('carve');
                break;
            case 'credentials':
                setLayar('credentials');
                break;
            case 'audit_keamanan':
                setLayar('security');
                break;
            case 'settings':
                setPesan({ type: 'info', title: 'Gunakan command `lembaran settings` untuk manajemen .env yang lebih mendalam.' });
                setLayar('message');
                break;
            case 'exit':
                showSessionSummaryAndExit();
                break;
            default:
                setPesan({ type: 'info', title: `Fitur "${aksi}" akan segera hadir di versi TUI berikutnya.` });
                setLayar('message');
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
                    type: 'info',
                    title: '⚠️  Tekan sekali lagi untuk exit (atau tunggu 3 detik)'
                });

                // Show exit info after 1 second
                setTimeout(() => {
                    console.log('\n╭─────────────────────────────────────────────────────────────────╮');
                    console.log('│  ℹ️  Exit Info                                                   │');
                    console.log('├─────────────────────────────────────────────────────────────────┤');
                    console.log('│  • Tekan Ctrl+C / Q / Esc sekali lagi untuk exit             │');
                    console.log('│  • Atau tunggu 3 detik untuk membatalkan                       │');
                    console.log('│  • Session summary akan ditampilkan setelah exit             │');
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
        if (screen === 'message' && (input === 'q' || key.escape || key.return)) {
            goToMenu();
        }
    });

    const renderLayar = () => {
        switch (screen) {
            case 'selamat':
                return <WelcomeScreen context={context} versi={versi} onComplete={goToMenu} />;
            case 'menu':
                return <MainMenu onSelect={handleSelect} initialAction={lastAction} />;
            case 'monitor':
                return <MonitorScreen context={context} onBack={goToMenu} />;
            case 'browse':
                return <ArchiveScreen onBack={goToMenu} initialSearch={initialFilter} />;
            case 'carve':
                return <CarveScreen onBack={goToMenu} />;
            case 'credentials':
                return <CredentialsScreen onBack={goToMenu} />;
            case 'security':
                return <SecurityScreen onBack={goToMenu} />;
            case 'message':
                return (
                    <Box flexDirection="column" padding={1}>
                        {message && <MessageBox type={message.type} title={message.title} isi="Tekan [Enter] atau [q] untuk kembali ke menu." />}
                    </Box>
                );
            default:
                return <MainMenu onSelect={handleSelect} initialAction={lastAction} />;
        }
    };

    const screenName = {
        selamat: 'Selamat Datang',
        menu: 'Menu Utama',
        monitor: 'Status',
        browse: 'Arsip',
        carve: 'Ukir',
        credentials: 'Kredensial',
        security: 'Keamanan',
        message: 'Info',
    }[screen] || 'Menu Utama';

    return (
        <Box flexDirection="column" key="aplikasi-root">
            <Box flexDirection="column" marginBottom={1} key="aplikasi-content">
                {renderLayar()}
            </Box>
            <StatusBar context={context} versi={versi} screen={screenName} />
        </Box>
    );
};
