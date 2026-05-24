import React from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { UI_TOKENS } from './theme.js';
import { generateIssueUrl, openReport } from './reporter.js';

interface CrashScreenProps {
    error: Error;
    screen?: string;
}

export const CrashScreen: React.FC<CrashScreenProps> = ({ error, screen }) => {
    const { exit } = useApp();
    
    useInput((input, key) => {
        if (key.return) {
            const url = generateIssueUrl(error, { screen });
            openReport(url);
            exit();
        }
        if (input === 'q' || key.escape) {
            exit();
        }
    });

    return (
        <Box flexDirection="column" padding={2} width="100%" borderStyle="double" borderColor={UI_TOKENS.danger}>
            <Box marginBottom={1}>
                <Text color={UI_TOKENS.danger} bold backgroundColor="white"> ⚠️ FATAL SYSTEM ERROR </Text>
            </Box>

            <Box flexDirection="column" marginBottom={1}>
                <Text color={UI_TOKENS.text} bold>Lembaranzz has encountered a critical failure.</Text>
                <Text color={UI_TOKENS.meta}>Diagnostic data has been aggregated for the Autonomous Engine.</Text>
            </Box>

            <Box borderStyle="round" borderColor={UI_TOKENS.brand} paddingX={1} flexDirection="column" marginBottom={1}>
                <Text color={UI_TOKENS.brand} bold>[ERROR TYPE]</Text>
                <Text color={UI_TOKENS.text}>{error.name}: {error.message}</Text>
            </Box>

            <Box borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1} flexDirection="column" height={8}>
                <Text color={UI_TOKENS.meta} bold>[STACK TRACE]</Text>
                <Box marginTop={1}>
                    <Text color={UI_TOKENS.meta} dimColor wrap="truncate">
                        {error.stack || 'No trace available'}
                    </Text>
                </Box>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Box>
                    <Text color={UI_TOKENS.accent} bold>[Enter] </Text>
                    <Text color={UI_TOKENS.text}>Open GitHub Issue (AI-Optimized Form)</Text>
                </Box>
                <Box>
                    <Text color={UI_TOKENS.meta} bold>[q]     </Text>
                    <Text color={UI_TOKENS.meta}>Exit Terminal</Text>
                </Box>
            </Box>

            <Box marginTop={1}>
                <Text color={UI_TOKENS.brand} dimColor italic>Sovereignty remains secure. Data encryption intact.</Text>
            </Box>
        </Box>
    );
};
