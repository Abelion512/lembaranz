import React, { useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { StatusBar } from './StatusBar.js';
import { WelcomeScreen } from './WelcomeScreen.js';
import { MainMenu } from './MainMenu.js';
import { SecurityScreen } from './SecurityScreen.js';
import { MessageBox } from './MessageBox.js';
import { CredentialsScreen } from './CredentialsScreen.js';
import { ArchiveScreen } from './ArchiveScreen.js';
import { CrashScreen } from './CrashScreen.js';
import { SettingsScreen } from './SettingsScreen.js';
import { UI_TOKENS } from './theme.js';

type Layar = 'selamat' | 'menu' | 'security' | 'message' | 'browse' | 'credentials' | 'settings';

interface AppProps {
    context: string;
    versi: string;
    initialScreen?: Layar;
}

class ErrorBoundary extends Component<{ children: ReactNode; screen: string }, { hasError: boolean; error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Optional: log to hidden local file
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return <CrashScreen error={this.state.error} screen={this.props.screen} />;
        }
        return this.props.children;
    }
}

export const App: React.FC<AppProps> = ({ context, versi, initialScreen }) => {
    const { exit } = useApp();
    const [screen, setLayar] = useState<Layar>(initialScreen || 'selamat');
    const [lastMenuIndex, setLastMenuIndex] = useState(0);
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
                setLayar('settings');
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
                // Snappy 1s threshold (Claude-style)
                setTimeout(() => { setExitAttempts(0); }, 1000);
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
                return <MainMenu
                    initialIndex={lastMenuIndex}
                    onSelect={handleSelect}
                    onHighlightIndex={(idx) => setLastMenuIndex(idx)}
                />;
            case 'browse':
                return <ArchiveScreen onBack={goToMenu} />;
            case 'credentials':
                return <CredentialsScreen onBack={goToMenu} />;
            case 'security':
                return <SecurityScreen onBack={goToMenu} />;
            case 'settings':
                return <SettingsScreen onBack={goToMenu} />;
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
        credentials: 'Store',
        security: 'Health Check',
        settings: 'Settings',
        message: 'Info',
    }[screen] || 'Main Menu';

    return (
        <ErrorBoundary screen={screenName}>
            <Box flexDirection="column" width="100%">
                <Box flexDirection="column" marginBottom={0} width="100%">
                    {renderLayar()}
                </Box>
                
                {exitAttempts > 0 && (
                    <Box paddingX={1}>
                        <Text color={UI_TOKENS.brand} bold>[!] Press again to Exit</Text>
                    </Box>
                )}

                <StatusBar context={context} versi={versi} screen={screenName} />
            </Box>
        </ErrorBoundary>
    );
};
