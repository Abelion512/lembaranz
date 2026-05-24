import React from 'react';
import { Box, Text, useInput } from 'ink';
import os from 'os';
import { UI_TOKENS } from './theme.js';

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onBack();
        }
    });

    const CONFIG_ITEMS = [
        { label: 'Storage Root', value: '~/.lembaranzz' },
        { label: 'Default Context', value: 'SAKU (Global)' },
        { label: 'Encryption Mode', value: 'AES-GCM-256' },
        { label: 'Compression', value: 'Gzip-Level-9' },
        { label: 'Runtime Engine', value: process.version },
        { label: 'Architecture', value: `${os.type()} ${os.arch()}` },
    ];

    return (
        <Box flexDirection="column" padding={1} width="100%">
            <Box borderStyle="round" borderColor={UI_TOKENS.accent} paddingX={1} marginBottom={1} width="100%">
                <Text color={UI_TOKENS.accent} bold>⚙️ SYSTEM CONFIGURATION & ENVIRONMENT</Text>
            </Box>

            <Box flexDirection="column" paddingX={1}>
                {CONFIG_ITEMS.map((item, index) => (
                    <Box key={item.label} marginBottom={1}>
                        <Text color={UI_TOKENS.brand} bold width={20}>{item.label}:</Text>
                        <Text color={UI_TOKENS.text} wrap="truncate-end">{item.value}</Text>
                    </Box>
                ))}
            </Box>

            <Box borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1} marginTop={1}>
                <Text color={UI_TOKENS.meta}>
                    Configuration changes are currently managed via <Text color={UI_TOKENS.brand} bold>context7.json</Text>. 
                    Direct TUI editing is coming in a future update.
                </Text>
            </Box>

            <Box marginTop={1} paddingX={1}>
                <Text color={UI_TOKENS.meta} dimColor italic>Press [q] or [Esc] to return to menu</Text>
            </Box>
        </Box>
    );
};
