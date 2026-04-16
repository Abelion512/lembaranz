import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
    context: string;
    versi: string;
    screen?: string;
    isLocked?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ context, versi, screen, isLocked }) => {
    const contextColor = context === 'saku' ? 'cyan' : 'yellow';
    
    return (
        <Box paddingX={1} justifyContent="space-between" key={`bar-${context}-${screen}`}>
            <Box>
                <Text color="cyan" bold>📜 Lembaranz</Text>
                <Text color="gray"> {versi}</Text>
                <Text color="gray"> • </Text>
                <Text color={isLocked ? 'yellow' : 'green'}>
                    {isLocked ? '🔒 Locked' : '🔓 Secure'}
                </Text>
            </Box>
            
            {screen && (
                <Box borderStyle="single" borderTop={false} borderBottom={false} borderLeft={true} borderRight={true} borderColor="gray" paddingX={1}>
                    <Text color="gray" dimColor>{screen}</Text>
                </Box>
            )}
            
            <Box>
                <Text color={contextColor} bold>{context.toUpperCase()}</Text>
                <Text color="gray" dimColor> • q:exit</Text>
            </Box>
        </Box>
    );
};
