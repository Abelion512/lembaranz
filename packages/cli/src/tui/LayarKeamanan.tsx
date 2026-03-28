import React from 'react';
import { Box, Text, useInput } from 'ink';

interface LayarKeamananProps {
    onKembali: () => void;
}

const ITEMS = [
    {
        judul: '1. Algoritma Enkripsi',
        status: '✅ AES-GCM 256-bit',
        detail: 'Lapis ganda untuk konten dan judul catatan.',
        warna: 'green' as const,
    },
    {
        judul: '2. Derivasi Kunci',
        status: '✅ Argon2id (Standard OWASP)',
        detail: 'Sangat tahan terhadap serangan Brute-Force dan GPU cracking.',
        warna: 'green' as const,
    },
    {
        judul: '3. Integritas Data',
        status: '✅ Segel Digital SHA-256',
        detail: 'Mendeteksi modifikasi ilegal oleh malware atau pihak ketiga.',
        warna: 'green' as const,
    },
    {
        judul: '4. Filtrasi Otonom',
        status: '✅ Secret Scrubber (PenyaringRahasia)',
        detail: 'Menghapus kredensial otomatis sebelum diproses oleh AI.',
        warna: 'green' as const,
    },
];

export const LayarKeamanan: React.FC<LayarKeamananProps> = ({ onKembali }) => {
    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onKembali();
        }
    });

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>🛡️ Dashboard Keamanan & Privasi</Text>
            </Box>

            <Box flexDirection="column" paddingX={1} gap={0}>
                {ITEMS.map((item, index) => (
                    <Box key={`${item.judul}-${index}`} borderStyle="round" borderColor={item.warna} paddingX={1} flexDirection="column" marginBottom={1}>
                        <Text bold>{item.judul}</Text>
                        <Text color={item.warna}>{item.status}</Text>
                        <Text color="gray" dimColor>{item.detail}</Text>
                    </Box>
                ))}
            </Box>

            <Box paddingX={1} marginTop={1}>
                <Box borderStyle="round" borderColor="cyan" paddingX={1}>
                    <Text color="cyan" bold>Kesimpulan: Sistem Anda memiliki Kedaulatan Mutlak.</Text>
                </Box>
            </Box>

            <Box marginTop={1} paddingX={1}>
                <Text color="gray" dimColor italic>Tekan [q] atau [Esc] untuk kembali</Text>
            </Box>
        </Box>
    );
};
