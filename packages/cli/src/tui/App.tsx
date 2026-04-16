import React, { useState, useCallback, useEffect } from 'react';
import { Box, useApp, useInput, Text } from 'ink';
import { StatusBar } from './StatusBar.js';
import { WelcomeScreen } from './WelcomeScreen.js';
import { MainMenu } from './MainMenu.js';
import { SecurityScreen } from './SecurityScreen.js';
import { MessageBox } from './MessageBox.js';
import { CredentialsScreen } from './CredentialsScreen.js';
import { ArchiveScreen } from './ArchiveScreen.js';
import { reportToGithub } from '../error.js';
import { Vault, Context } from '@lembaranz/core';
import { CommandPopup } from './components/CommandPopup.js';
import { ModeSelectScreen } from './ModeSelectScreen.js';

type Layar = 'setup' | 'selamat' | 'menu' | 'security' | 'message' | 'browse' | 'credentials' | 'type_mode';

interface AppProps {
    context: string;
    versi: string;
    initialScreen?: Layar;
}

export const App: React.FC<AppProps> = ({ context, versi, initialScreen }) => {
    const { exit } = useApp();
    const [screen, setLayar] = useState<Layar>(initialScreen || 'selamat');
    const [message, setPesan] = useState<{ type: 'success' | 'info' | 'error'; title: string; error?: any } | null>(null);
    const [tuiMode, setTuiMode] = useState<'scroll' | 'type' | 'loading'>('loading');
    const [showPopup, setShowPopup] = useState(false);
    const [exitAttempts, setExitAttempts] = useState(0);
    const isLocked = Vault.isLocked();

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await Context.readSettings();
            if (settings.tuiMode) {
                setTuiMode(settings.tuiMode);
            } else {
                setTuiMode('loading');
                setLayar('setup');
            }
        };
        loadSettings();
    }, []);

    const goToMenu = useCallback(() => {
        if (tuiMode === 'type') {
            setLayar('type_mode');
        } else {
            setLayar('menu');
        }
    }, [tuiMode]);

    const handleModeSelect = async (m: 'scroll' | 'type') => {
        setTuiMode(m);
        await Context.writeSettings({ tuiMode: m });
        if (m === 'type') {
            setLayar('type_mode');
        } else {
            setLayar('menu');
        }
    };

    const handleSelect = useCallback((aksi: string) => {
        setShowPopup(false);
        switch (aksi) {
            case 'browse':
            case '/browse':
                setLayar('browse');
                break;
            case 'credentials':
            case '/save':
                setLayar('credentials');
                break;
            case 'audit_keamanan':
            case '/audit':
                setLayar('security');
                break;
            case 'settings':
            case '/settings':
                setPesan({ type: 'info', title: 'Settings are managed via terminal commands: `lembaran settings`' });
                setLayar('message');
                break;
            case 'exit':
            case '/exit':
            case '/quit':
                exit();
                break;
            case '/menu':
                setLayar('menu');
                break;
            default:
                if (aksi.startsWith('/')) {
                    // Handle as command if it starts with slash but wasn't caught above
                    setPesan({ type: 'info', title: `Command '${aksi}' recognized but not implemented in TUI yet.` });
                    setLayar('message');
                }
                break;
        }
    }, [exit]);

    useInput((input, key) => {
        // Toggle Popup with '/'
        if (input === '/' && !showPopup && screen !== 'setup') {
            setShowPopup(true);
            return;
        }

        if (showPopup) return; // CommandPopup handles its own input

        // Handle message screen
        if (screen === 'message' && (input === 'q' || key.escape || key.return)) {
            if (key.return && message?.type === 'error' && message.error) {
                reportToGithub(message.error);
            }
            goToMenu();
            return;
        }

        const isExitKey = (key.ctrl && input === 'c') || input === 'q' || key.escape;

        if (isExitKey) {
            if (screen === 'menu' || screen === 'selamat' || screen === 'type_mode') {
                if (exitAttempts === 0) {
                    setExitAttempts(1);
                    setPesan({ type: 'info', title: 'Press again to exit' });
                    setTimeout(() => { setExitAttempts(0); }, 3000);
                } else {
                    exit();
                }
            } else {
                goToMenu();
            }
            return;
        }
    });

    const renderLayar = () => {
        if (tuiMode === 'loading' && screen !== 'setup' && screen !== 'selamat') {
            return <Box padding={2}><Text color="gray">Initializing...</Text></Box>;
        }

        switch (screen) {
            case 'setup':
                return <ModeSelectScreen onSelect={handleModeSelect} />;
            case 'selamat':
                return <WelcomeScreen versi={versi} onComplete={goToMenu} />;
            case 'type_mode':
                return (
                    <Box flexDirection="column" paddingX={4} paddingY={4} alignItems="center" justifyContent="center" flexGrow={1}>
                        <Text color="#FF5733" bold> LEMBARANZ </Text>
                        <Text color="gray"> How can we help you today? </Text>
                        <Box marginTop={2} borderStyle="round" borderColor="gray" paddingX={2}>
                            <Text dimColor> Press </Text>
                            <Text color="#FF5733" bold> / </Text>
                            <Text dimColor> to open commands... </Text>
                        </Box>
                    </Box>
                );
            case 'menu':
                return <MainMenu onSelect={handleSelect} isFocused={!showPopup} />;
            case 'browse':
                return <ArchiveScreen onBack={goToMenu} isFocused={!showPopup} />;
            case 'credentials':
                return <CredentialsScreen onBack={goToMenu} isFocused={!showPopup} />;
            case 'security':
                return <SecurityScreen onBack={goToMenu} isFocused={!showPopup} />;
            case 'message':
                return (
                    <Box flexDirection="column" paddingX={2} marginTop={1}>
                        {message && <MessageBox type={message.type} title={message.title} isi="Press [Enter] or [q] to go back." />}
                    </Box>
                );
            default:
                return <MainMenu onSelect={handleSelect} />;
        }
    };

    const screenName = {
        setup: 'Setup',
        selamat: 'Welcome',
        menu: 'Menu',
        browse: 'Archive',
        credentials: 'Vault',
        security: 'Security',
        message: 'Info',
        type_mode: 'Command',
    }[screen] || 'Menu';

    return (
        <Box 
            flexDirection="column" 
            width="100%" 
            minHeight={22} 
            backgroundColor="black"
            borderStyle="round"
            borderColor="#FF5733"
            marginX={1}
            marginTop={1}
        >
            {/* Main Content Area */}
            <Box flexDirection="column" flexGrow={1} width="100%">
                {renderLayar()}
            </Box>

            {/* Overlay Popup */}
            {showPopup && (
                <CommandPopup 
                    onSelect={handleSelect} 
                    onClose={() => setShowPopup(false)} 
                />
            )}

            {/* Bottom Section: Integrated Status Bar */}
            <Box flexDirection="column" width="100%" borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray">
                <StatusBar context={context} versi={versi} screen={screenName} isLocked={isLocked} />
            </Box>
        </Box>
    );
};

