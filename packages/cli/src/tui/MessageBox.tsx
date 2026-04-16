import React from 'react';
import { Box, Text } from 'ink';
import { UI_TOKENS } from './theme.js';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageBoxProps {
    type: MessageType;
    title: string;
    isi?: string;
}

const COLORS: Record<MessageType, string> = {
    success: UI_TOKENS.accent,
    error: UI_TOKENS.danger,
    warning: '#F59E0B', // Amber
    info: UI_TOKENS.brand,
};

const ICONS: Record<MessageType, string> = {
    success: '[✔]',
    error: '[✘]',
    warning: '[!]',
    info: '[i]',
};

export const MessageBox: React.FC<MessageBoxProps> = ({ type, title, isi }) => {
    const color = COLORS[type];
    const icon = ICONS[type];

    return (
        <Box borderStyle="round" borderColor={color} paddingX={1} flexDirection="column" alignSelf="center" width={60}>
            <Text color={color} bold>{icon} {title}</Text>
            {isi && <Text color={UI_TOKENS.meta}>{isi}</Text>}
        </Box>
    );
};
