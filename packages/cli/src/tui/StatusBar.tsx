import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
    context: string;
    versi: string;
    screen?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ context, versi, screen }) => {
    return (
        <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between" key={`bar-${context}-${screen}`}>
            <Text>
                <Text color="cyan" bold>📜 Lembaran</Text>
                <Text color="gray"> {versi}</Text>
            </Text>
            {screen && <Text color="gray" dimColor>[ {screen} ]</Text>}
            <Text>
                <Text color="yellow" bold>{context.toUpperCase()}</Text>
                <Text color="gray" dimColor> • q:exit</Text>
            </Text>
        </Box>
    );
};
