import React from 'react';
import { Box, Text } from 'ink';
import { ModernSelect } from './components/ModernSelect.js';

interface MainMenuProps {
    onSelect: (aksi: string) => void;
    initialAction?: string;
    isFocused?: boolean;
}

// Simple menu - beginner-friendly
const MENU_ITEMS = [
    { label: '📁  Save Credentials [/save]', value: 'credentials' },
    { label: '📋  View Credentials [/browse]', value: 'browse' },
    { label: '⚙️   Settings [/settings]', value: 'settings' },
    { label: '🛡️   Security [/audit]', value: 'audit_keamanan' },
    { label: '✨  Exit [/exit]', value: 'exit' },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect, initialAction, isFocused = true }) => {
    const initialIndex = Math.max(0, MENU_ITEMS.findIndex(item => item.value === initialAction));

    return (
        <Box 
            flexDirection="column" 
            paddingX={1} 
            paddingY={1} 
        >
            {/* Prominent Header (Filled-style) */}
            <Box flexDirection="column" paddingX={1} marginBottom={1}>
                <Text color="#FF5733" bold>
{'  _                     _                                      \n'}
{' | |                   | |                                     \n'}
{' | |     ___ _ __ ___  | |__   __ _ _ __ __ _ _ __  ____       \n'}
{' | |    / _ \\ \'_ ` _ \\ | \'_ \\ / _` | \'__/ _` | \'_ \\|_  /       \n'}
{' | |___|  __/ | | | | || |_) | (_| | | | (_| | | | |/ /        \n'}
{' \\_____/\\___|_| |_| |_||_.__/ \\__,_|_|  \\__,_|_| |_/___|       '}
                </Text>
                <Box flexDirection="row" alignItems="center" marginTop={1}>
                    <Box backgroundColor="cyan" paddingX={1} marginRight={1}>
                        <Text color="black" bold> PREMIUM </Text>
                    </Box>
                    <Text color="gray" dimColor>Self-Hosted Vault</Text>
                    <Text color="gray"> · </Text>
                    <Text color="gray" dimColor>v1.0.1</Text>
                </Box>
            </Box>

            <Box flexDirection="column" paddingX={1} minHeight={7}>
                <ModernSelect
                    items={MENU_ITEMS}
                    limit={5}
                    isLooping={false}
                    initialIndex={initialIndex}
                    onSelect={(item) => onSelect(item.value)}
                    isFocused={isFocused}
                />
            </Box>

            <Box paddingX={1} marginTop={1} borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray">
                <Text color="gray" dimColor italic>Press [q] or [Esc] to exit • [/] for commands</Text>
            </Box>
        </Box>
    );
};

