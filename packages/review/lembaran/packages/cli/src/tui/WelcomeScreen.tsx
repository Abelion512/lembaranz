import React from 'react';
import { Box, Text } from 'ink';

interface WelcomeScreenProps {
    versi: string;
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ versi, onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" padding={1}>
            <Text color="cyan" bold>
{'\n'}
{'  ███████╗███████╗██████╗ ███████╗██╗     ██╗ ██████╗\n'}
{'  ██╔════╝██╔════╝██╔══██╗██╔════╝██║    ██╔════╝\n'}
{'  █████╗  █████╗  ██║  ██║█████╗  ██║    ██║\n'}
{'  ██╔══╝  ██╔══╝  ██║  ██║██╔══╝  ██║    ██║\n'}
{'  ██║     ███████╗██║  ██║██║     ██║    ██║\n'}
{'  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝\n'}
            </Text>

            <Box marginTop={1} flexDirection="column" alignItems="center">
                <Text color="gray" dimColor>v{versi} • Self-Hosted Credential Vault</Text>
            </Box>

            <Box marginTop={1}>
                <Text color="gray" dimColor italic>Loading interface...</Text>
            </Box>
        </Box>
    );
};
