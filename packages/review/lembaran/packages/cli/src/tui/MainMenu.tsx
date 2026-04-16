import React from 'react';
import { Box, Text } from 'ink';
import { ModernSelect } from './components/ModernSelect.js';

interface MainMenuProps {
    onSelect: (aksi: string) => void;
    initialAction?: string;
}

// Simple menu - beginner-friendly
const MENU_ITEMS = [
    { label: '📁  Save Credentials', value: 'credentials' },
    { label: '📋  View Credentials', value: 'browse' },
    { label: '⚙️   Settings', value: 'settings' },
    { label: '🛡️   Security', value: 'audit_keamanan' },
    { label: '✨  Exit', value: 'exit' },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect, initialAction }) => {
    const initialIndex = Math.max(0, MENU_ITEMS.findIndex(item => item.value === initialAction));

    return (
        <Box flexDirection="column" padding={1}>
            {/* Compact header */}
            <Box flexDirection="column" alignItems="center" marginBottom={1}>
                <Text color="cyan" bold>
                    ███████╗███████╗██████╗ ███████╗██╗     ██╗ ██████╗
                    ██╔════╝██╔════╝██╔══██╗██╔════╝██║    ██╔════╝
                    █████╗  █████╗  ██║  ██║█████╗  ██║    ██║
                    ██╔══╝  ██╔══╝  ██║  ██║██╔══╝  ██║    ██║
                    ██║     ███████╗██║  ██║██║     ██║    ██║
                    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝
                </Text>
                <Text color="gray" dimColor>v1.0.1 • Self-Hosted Credential Vault</Text>
            </Box>

            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📜 Main Menu</Text>
            </Box>

            <Box paddingX={1}>
                <ModernSelect
                    items={MENU_ITEMS}
                    limit={5}
                    isLooping={false}
                    initialIndex={initialIndex}
                    onSelect={(item) => onSelect(item.value)}
                />
            </Box>

            <Box paddingX={1} marginTop={1}>
                <Text color="gray" dimColor italic>Tekan [q] atau [Esc] untuk kembali</Text>
            </Box>
        </Box>
    );
};
