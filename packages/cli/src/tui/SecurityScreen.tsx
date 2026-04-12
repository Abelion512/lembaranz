import React from 'react';
import { Box, Text, useInput } from 'ink';

interface SecurityScreenProps {
    onBack: () => void;
}

const ITEMS = [
    {
        title: '1. Algoritma Enkripsi',
        status: '✅ AES-GCM 256-bit',
        detail: 'Lapis ganda untuk content dan title catatan.',
        color: 'green' as const,
    },
    {
        title: '2. Derivasi Kunci',
        status: '✅ Argon2id (Standard OWASP)',
        detail: 'Sangat tahan terhadap serangan Brute-Force dan GPU cracking.',
        color: 'green' as const,
    },
    {
        title: '3. Integritas Data',
        status: '✅ Segel Digital SHA-256',
        detail: 'Mendeteksi modifikasi ilegal oleh malware atau pihak ketiga.',
        color: 'green' as const,
    },
    {
        title: '4. Filtrasi Otonom',
        status: '✅ Secret Scrubber (PenyaringRahasia)',
        detail: 'Menghapus credentials otomatis sebelum diproses oleh AI.',
        color: 'green' as const,
    },
];

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ onBack }) => {
    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onBack();
        }
    });

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>🛡️ Dashboard Keamanan & Privasi</Text>
            </Box>

            <Box flexDirection="column" paddingX={1} gap={0}>
                {ITEMS.map((item, index) => (
                    <Box key={`${item.title}-${index}`} borderStyle="round" borderColor={item.color} paddingX={1} flexDirection="column" marginBottom={1}>
                        <Text bold>{item.title}</Text>
                        <Text color={item.color}>{item.status}</Text>
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
