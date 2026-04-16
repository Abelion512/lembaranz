import React from 'react';
import { Box, Text } from 'ink';
import { ModernSelect } from './components/ModernSelect.js';
import { Header } from './components/Header.js';
import { UI_TOKENS, UI_SYMBOLS } from './theme.js';

interface MainMenuProps {
    onSelect: (aksi: string) => void;
    initialIndex?: number;
    onHighlightIndex?: (index: number) => void;
}

const MENU_ITEMS = [
    { label: `${UI_SYMBOLS.dir}  Store Credentials`, value: 'credentials' },
    { label: `${UI_SYMBOLS.lst}  View Archive`, value: 'browse' },
    { label: `${UI_SYMBOLS.cfg}  System Config`, value: 'settings' },
    { label: `${UI_SYMBOLS.doc}  Health Check`, value: 'audit_keamanan' },
    { label: `${UI_SYMBOLS.ext}  Exit`, value: 'exit' },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect, initialIndex = 0, onHighlightIndex }) => {
    return (
        <Box flexDirection="column" padding={1} width="100%">
            <Header />

            <Box borderStyle="round" borderColor={UI_TOKENS.accent} paddingX={1} marginBottom={1} alignSelf="center">
                <Text color={UI_TOKENS.accent} bold>SELECT OPERATION</Text>
            </Box>

            <Box paddingX={2} alignSelf="center" width={50}>
                <ModernSelect
                    items={MENU_ITEMS}
                    limit={5}
                    isLooping={true}
                    initialIndex={initialIndex}
                    onSelect={(item) => onSelect(item.value)}
                    onHighlight={(item, index) => onHighlightIndex?.(index)}
                />
            </Box>

            <Box alignSelf="center" marginTop={1}>
                <Text color={UI_TOKENS.meta} dimColor italic>Press [q] or [Esc] to exit window</Text>
            </Box>
        </Box>
    );
};
