import React from 'react';
import { Box, Text } from 'ink';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageBoxProps {
    type: MessageType;
    title: string;
    isi?: string;
}

const COLORS: Record<MessageType, string> = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
};

const ICONS: Record<MessageType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export const MessageBox: React.FC<MessageBoxProps> = ({ type, title, isi }) => {
    const color = COLORS[type];
    const icon = ICONS[type];

    return (
        <Box borderStyle="round" borderColor={color} paddingX={1} flexDirection="column">
            <Text color={color} bold>{icon} {title}</Text>
            {isi && <Text color="gray">{isi}</Text>}
        </Box>
    );
};
