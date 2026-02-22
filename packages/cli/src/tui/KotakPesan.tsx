import React from 'react';
import { Box, Text } from 'ink';

type JenisPesan = 'sukses' | 'error' | 'warning' | 'info';

interface KotakPesanProps {
    jenis: JenisPesan;
    judul: string;
    isi?: string;
}

const WARNA: Record<JenisPesan, string> = {
    sukses: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
};

const IKON: Record<JenisPesan, string> = {
    sukses: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export const KotakPesan: React.FC<KotakPesanProps> = ({ jenis, judul, isi }) => {
    const warna = WARNA[jenis];
    const ikon = IKON[jenis];

    return (
        <Box borderStyle="round" borderColor={warna} paddingX={1} flexDirection="column">
            <Text color={warna} bold>{ikon} {judul}</Text>
            {isi && <Text color="gray">{isi}</Text>}
        </Box>
    );
};
