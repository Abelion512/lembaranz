import React from 'react';
import { Box, Text } from 'ink';

interface BarStatusProps {
    konteks: string;
    versi: string;
    layar?: string;
}

export const BarStatus: React.FC<BarStatusProps> = ({ konteks, versi, layar }) => {
    return (
        <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between" key={`bar-${konteks}-${layar}`}>
            <Text>
                <Text color="cyan" bold>📜 Lembaran</Text>
                <Text color="gray"> {versi}</Text>
            </Text>
            {layar && <Text color="gray" dimColor>[ {layar} ]</Text>}
            <Text>
                <Text color="yellow" bold>{konteks.toUpperCase()}</Text>
                <Text color="gray" dimColor> • q:keluar</Text>
            </Text>
        </Box>
    );
};
