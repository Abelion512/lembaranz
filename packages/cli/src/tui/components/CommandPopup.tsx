import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

interface CommandPopupProps {
    onSelect: (value: string) => void;
    onClose: () => void;
}

const COMMANDS = [
    { label: 'Save Credentials', value: '/save', category: 'Action', icon: '📁' },
    { label: 'Browse Vault', value: '/browse', category: 'Action', icon: '📋' },
    { label: 'Security Audit', value: '/audit', category: 'Security', icon: '🛡️' },
    { label: 'System Settings', value: '/settings', category: 'Config', icon: '⚙️' },
    { label: 'Back to Menu', value: '/menu', category: 'Nav', icon: '🏠' },
    { label: 'Exit Lembaranz', value: '/exit', category: 'System', icon: '✨' },
];

export const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredCommands = useMemo(() => {
        return COMMANDS.filter(cmd => 
            cmd.label.toLowerCase().includes(query.toLowerCase()) || 
            cmd.value.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    useInput((input, key) => {
        if (key.escape) {
            onClose();
            return;
        }

        if (key.upArrow) {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        } else if (key.downArrow) {
            setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        } else if (key.return) {
            if (filteredCommands[selectedIndex]) {
                onSelect(filteredCommands[selectedIndex].value);
            }
        } else if (key.backspace || key.delete) {
            setQuery(prev => prev.slice(0, -1));
            setSelectedIndex(0);
        } else if (input && !key.ctrl && !key.meta) {
            setQuery(prev => prev + input);
            setSelectedIndex(0);
        }
    });

    return (
        <Box 
            flexDirection="column" 
            position="absolute"
            bottom={1}
            left={2}
            width={60}
            borderStyle="round" 
            borderColor="#FF5733" 
            paddingX={1}
            backgroundColor="black"
        >
            <Box marginBottom={1}>
                <Text color="#FF5733" bold> COMMAND </Text>
                <Text color="gray"> › </Text>
                <Text bold>{query || 'Type to search...'}</Text>
                {query.length === 0 && <Text color="gray" dimColor> (e.g. /save)</Text>}
            </Box>

            <Box flexDirection="column">
                {filteredCommands.length === 0 ? (
                    <Text color="gray" italic> No commands found.</Text>
                ) : (
                    filteredCommands.map((cmd, index) => (
                        <Box key={cmd.value} paddingX={1} backgroundColor={index === selectedIndex ? '#FF5733' : undefined}>
                            <Text color={index === selectedIndex ? 'black' : 'gray'}> {cmd.icon} </Text>
                            <Box flexGrow={1}>
                                <Text bold={index === selectedIndex} color={index === selectedIndex ? 'black' : 'white'}>
                                    {cmd.label}
                                </Text>
                            </Box>
                            <Text color={index === selectedIndex ? 'black' : 'gray'} dimColor={index !== selectedIndex}>
                                {cmd.value}
                            </Text>
                        </Box>
                    ))
                )}
            </Box>

            <Box marginTop={1} paddingX={1} borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray">
                <Text color="gray" dimColor size="tiny">
                    ↑↓ navigate • enter select • esc close
                </Text>
            </Box>
        </Box>
    );
};
