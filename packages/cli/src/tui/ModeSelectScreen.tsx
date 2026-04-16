import React from 'react';
import { Box, Text } from 'ink';
import { ModernSelect } from './components/ModernSelect.js';

interface ModeSelectScreenProps {
    onSelect: (mode: 'scroll' | 'type') => void;
}

const MODES = [
    { label: '🖱️  Scroll (Arrow Keys)', value: 'scroll', description: 'Traditional interactive menu using arrows and enter.' },
    { label: '⌨️   Type (Command Bar)', value: 'type', description: 'Power-user mode: Type commands directly or use / for shortcuts.' },
];

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({ onSelect }) => {
    return (
        <Box 
            flexDirection="column" 
            paddingX={4} 
            paddingY={1} 
            borderStyle="double" 
            borderColor="#FF5733"
            marginX={2}
            marginTop={2}
        >
            <Box marginBottom={1} flexDirection="column" alignItems="center">
                <Text color="#FF5733" bold> INITIAL SETUP </Text>
                <Text bold> How would you like to interact with Lembaranz? </Text>
                <Text color="gray" dimColor> Choose your preferred TUI experience </Text>
            </Box>

            <Box flexDirection="column" paddingY={1}>
                <ModernSelect
                    items={MODES}
                    onSelect={(item) => onSelect(item.value as 'scroll' | 'type')}
                    renderItem={(item, isSelected) => (
                        <Box flexDirection="column" marginBottom={1}>
                            <Text color={isSelected ? '#FF5733' : 'white'} bold={isSelected}>
                                {isSelected ? '❯ ' : '  '}{item.label}
                            </Text>
                            <Box paddingLeft={4}>
                                <Text color="gray" dimColor={!isSelected}>{item.description}</Text>
                            </Box>
                        </Box>
                    )}
                />
            </Box>

            <Box marginTop={1} borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray" paddingX={1}>
                <Text color="gray" dimColor italic>You can change this anytime in Settings.</Text>
            </Box>
        </Box>
    );
};
