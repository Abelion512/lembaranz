import React, { useState, useCallback } from 'react';
import { Box, useApp, useInput } from 'ink';
import { StatusBar } from './StatusBar.js';
import { WelcomeScreen } from './WelcomeScreen.js';
import { MainMenu } from './MainMenu.js';
import { SecurityScreen } from './SecurityScreen.js';
import { MessageBox } from './MessageBox.js';
import { CredentialsScreen } from './CredentialsScreen.js';
import { ArchiveScreen } from './ArchiveScreen.js';

type Layar = 'selamat' | 'menu' | 'security' | 'message' | 'browse' | 'credentials';

interface AppProps {
    context: string;
    versi: string;
    initialScreen?: Layar;
    initialFilter?: string;
}

export const App: React.FC<AppProps> = ({ context, versi, initialScreen }) => {
    const { exit } = useApp();
    const [screen, setLayar] = useState<Layar>(initialScreen || 'selamat');
    const [message, setPesan] = useState<{ type: 'success' | 'info'; title: string } | null>(null);
    const [exitAttempts, setExitAttempts] = useState(0);

    const goToMenu = useCallback(() => {
        setLayar('menu');
    }, []);

    const handleSelect = useCallback((aksi: string) => {
        switch (aksi) {
            case 'browse':
                setLayar('browse');
                break;
            case 'credentials':
                setLayar('credentials');
                break;
            case 'audit_keamanan':
                setLayar('security');
                break;
            case 'settings':
                setPesan({ type: 'info', title: 'Gunakan `lembaran settings` di terminal untuk konfigurasi.' });
                setLayar('message');
                break;
            case 'exit':
                exit();
                break;
            default:
                setPesan({ type: 'info', title: 'Fitur ini akan segera hadir.' });
                setLayar('message');
                break;
        }
    }, []);

    useInput((input, key) => {
        // Handle message screen first (highest priority)
        if (screen === 'message' && (input === 'q' || key.escape || key.return)) {
            setExitAttempts(0);
            goToMenu();
            return;
        }

        const isExitKey = (key.ctrl && input === 'c') || input === 'q' || key.escape;

        if (isExitKey) {
            if (exitAttempts === 0) {
                setExitAttempts(1);
                setPesan({ type: 'info', title: 'Press again to exit' });
                setTimeout(() => { setExitAttempts(0); }, 3000);
            } else {
                exit();
            }
            return;
        }
    });

    const renderLayar = () => {
        switch (screen) {
            case 'selamat':
                return <WelcomeScreen versi={versi} onComplete={goToMenu} />;
            case 'menu':
                return <MainMenu onSelect={handleSelect} />;
            case 'browse':
                return <ArchiveScreen onBack={goToMenu} />;
            case 'credentials':
                return <CredentialsScreen onBack={goToMenu} />;
            case 'security':
                return <SecurityScreen onBack={goToMenu} />;
            case 'message':
                return (
                    <Box flexDirection="column" padding={1}>
                        {message && <MessageBox type={message.type} title={message.title} isi="Press [Enter] or [q] to go back." />}
                    </Box>
                );
            default:
                return <MainMenu onSelect={handleSelect} />;
        }
    };

    const screenName = {
        selamat: 'Welcome',
        menu: 'Main Menu',
        browse: 'Archive',
        credentials: 'Credentials',
        security: 'Security',
        message: 'Info',
    }[screen] || 'Main Menu';

    return (
        <Box flexDirection="column" width="100%">
            <Box flexDirection="column" marginBottom={1} width="100%">
                {renderLayar()}
            </Box>
            <StatusBar context={context} versi={versi} screen={screenName} />
        </Box>
    );
};
