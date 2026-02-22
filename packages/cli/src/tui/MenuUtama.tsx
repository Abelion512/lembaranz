import React from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';

interface MenuUtamaProps {
    onPilih: (aksi: string) => void;
}

const MENU_ITEMS = [
    { label: '📊  Pantau Status Sistem', value: 'pantau' },
    { label: '📂  Jelajah Arsip Catatan', value: 'jelajah' },
    { label: '📝  Ukir Catatan Baru', value: 'ukir' },
    { label: '🔐  Simpan Kredensial', value: 'kredensial' },
    { label: '🛡️   Audit Keamanan', value: 'audit_keamanan' },
    { label: '⚔️   Mode Berdaulat (Otonom)', value: 'berdaulat' },
    { label: '🌱  Tanam (Impor .md)', value: 'tanam' },
    { label: '📦  Petik (Ekspor .lembaran)', value: 'petik' },
    { label: '🚀  Layani Server Sentinel', value: 'layani' },
    { label: '✨  Keluar', value: 'keluar' },
];

export const MenuUtama: React.FC<MenuUtamaProps> = ({ onPilih }) => {
    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📜 Menu Utama</Text>
            </Box>

            <Box paddingX={1}>
                <SelectInput
                    items={MENU_ITEMS}
                    onSelect={(item) => onPilih(item.value)}
                    indicatorComponent={({ isSelected }) => (
                        <Text color="cyan">{isSelected ? '❯ ' : '  '}</Text>
                    )}
                    itemComponent={({ isSelected, label }) => (
                        <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                            {label}
                        </Text>
                    )}
                />
            </Box>
        </Box>
    );
};
