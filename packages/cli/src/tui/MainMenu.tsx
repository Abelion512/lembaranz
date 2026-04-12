import React from 'react';
import { Box, Text } from 'ink';
import { ModernSelect } from './components/ModernSelect.js';

interface MainMenuProps {
    onSelect: (aksi: string) => void;
    initialAction?: string;
}

const MENU_ITEMS = [
    { label: '📊  Monitor System Status', value: 'monitor' },
    { label: '📂  Browse Note Archives', value: 'browse' },
    { label: '📝  Create New Note', value: 'carve' },
    { label: '🔐  Save Credentials', value: 'credentials' },
    { label: '⚙️   Settings (.env)', value: 'settings' },
    { label: '🛡️   Security Audit', value: 'audit_keamanan' },
    { label: '⚔️   Sovereign Mode (Autonomous)', value: 'sovereign' },
    { label: '🌱  Plant (Import .md)', value: 'import' },
    { label: '📦  Harvest (Export .lembaran)', value: 'export' },
    { label: '✨  Exit', value: 'exit' },
];

const LOGO = `
  ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗
  ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
  ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║
  ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║
  ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝
`.trim();

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect, initialAction }) => {
    const initialIndex = Math.max(0, MENU_ITEMS.findIndex(item => item.value === initialAction));

    return (
        <Box flexDirection="column" padding={1}>
            {/* Logo ASCII Permanen Lembaran */}
            <Box flexDirection="column" alignItems="center" marginBottom={2}>
                <Text color="cyan">{LOGO}</Text>
                <Text color="gray" dimColor>Self-Hosted Personal Credential Vault</Text>
            </Box>

            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📜 Main Menu</Text>
            </Box>

            <Box paddingX={1}>
                <ModernSelect
                    items={MENU_ITEMS}
                    limit={7}
                    isLooping={false}
                    initialIndex={initialIndex}
                    onSelect={(item) => onSelect(item.value)}
                />
            </Box>
        </Box>
    );
};
