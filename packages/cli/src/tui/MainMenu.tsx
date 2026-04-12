import React from 'react';
import { Box, Text } from 'ink';
import { PilihanModern } from './components/PilihanModern.js';

interface MainMenuProps {
    onSelect: (aksi: string) => void;
    initialAction?: string;
}

const MENU_ITEMS = [
    { label: '📊  Pantau Status Sistem', value: 'monitor' },
    { label: '📂  Jelajah Arsip Catatan', value: 'browse' },
    { label: '📝  Ukir Catatan Baru', value: 'carve' },
    { label: '🔐  Simpan Kredensial', value: 'credentials' },
    { label: '⚙️   Pengaturan (.env)', value: 'settings' },
    { label: '🛡️   Audit Keamanan', value: 'audit_keamanan' },
    { label: '⚔️   Mode Berdaulat (Otonom)', value: 'sovereign' },
    { label: '🌱  Tanam (Impor .md)', value: 'import' },
    { label: '📦  Petik (Ekspor .lembaran)', value: 'export' },
    { label: '✨  Keluar', value: 'exit' },
];

const LOGO = `
  ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗
  ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
  ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║
  ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║
  ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝
`.trim();

export const MenuUtama: React.FC<MainMenuProps> = ({ onSelect, initialAction }) => {
    const initialIndex = Math.max(0, MENU_ITEMS.findIndex(item => item.value === initialAction));

    return (
        <Box flexDirection="column" padding={1}>
            {/* Logo ASCII Permanen Lembaran */}
            <Box flexDirection="column" alignItems="center" marginBottom={2}>
                <Text color="cyan">{LOGO}</Text>
                <Text color="gray" dimColor>Brankas Aksara Personal yang Berdikari</Text>
            </Box>

            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📜 Menu Utama</Text>
            </Box>

            <Box paddingX={1}>
                <PilihanModern
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
