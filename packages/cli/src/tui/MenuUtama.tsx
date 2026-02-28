import React from 'react';
import { Box, Text } from 'ink';
import { PilihanModern } from './komponen/PilihanModern.js';

interface MenuUtamaProps {
    onPilih: (aksi: string) => void;
    aksiAwal?: string;
}

const MENU_ITEMS = [
    { label: '📊  Pantau Status Sistem', value: 'pantau' },
    { label: '📂  Jelajah Arsip Catatan', value: 'jelajah' },
    { label: '📝  Ukir Catatan Baru', value: 'ukir' },
    { label: '🔐  Simpan Kredensial', value: 'kredensial' },
    { label: '⚙️   Pengaturan (.env)', value: 'pengaturan' },
    { label: '🛡️   Audit Keamanan', value: 'audit_keamanan' },
    { label: '⚔️   Mode Berdaulat (Otonom)', value: 'berdaulat' },
    { label: '🌱  Tanam (Impor .md)', value: 'tanam' },
    { label: '📦  Petik (Ekspor .lembaran)', value: 'petik' },
    { label: '✨  Keluar', value: 'keluar' },
];

export const MenuUtama: React.FC<MenuUtamaProps> = ({ onPilih, aksiAwal }) => {
    const initialIndex = Math.max(0, MENU_ITEMS.findIndex(item => item.value === aksiAwal));

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📜 Menu Utama</Text>
            </Box>

            <Box paddingX={1}>
                <PilihanModern
                    items={MENU_ITEMS}
                    limit={7}
                    isLooping={false}
                    initialIndex={initialIndex}
                    onSelect={(item) => onPilih(item.value)}
                />
            </Box>
        </Box>
    );
};
