import React from 'react';
import { Box, Text } from 'ink';

interface WelcomeScreenProps {
    context: string;
    versi: string;
    onComplete: () => void;
}

const LOGO = `
  ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗
  ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
  ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║
  ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║
  ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝
`.trim();

export const LayarSelamat: React.FC<WelcomeScreenProps> = ({ context, versi, onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" padding={1} key="selamat-root">
            <Box key="logo-box">
                <Text color="cyan">{LOGO}</Text>
            </Box>

            <Box marginTop={1} flexDirection="column" alignItems="center" key="info-box">
                <Text color="gray" dimColor>Brankas Aksara Personal yang Berdikari</Text>
                <Text color="gray" dimColor>v{versi} • Konteks: <Text color="yellow" bold>{context.toUpperCase()}</Text></Text>
            </Box>

            <Box marginTop={1} key="loading-box">
                <Text color="gray" dimColor italic>Memuat antarmuka...</Text>
            </Box>
        </Box>
    );
};
