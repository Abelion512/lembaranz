import React from 'react';
import { Box, Text } from 'ink';

interface LayarSelamatProps {
    konteks: string;
    versi: string;
    onSelesai: () => void;
}

const LOGO = `
  ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗
  ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
  ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║
  ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║
  ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║
  ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝
`.trim();

export const LayarSelamat: React.FC<LayarSelamatProps> = ({ konteks, versi, onSelesai }) => {
    React.useEffect(() => {
        const timer = setTimeout(onSelesai, 2000);
        return () => clearTimeout(timer);
    }, [onSelesai]);

    return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" padding={1} key="selamat-root">
            <Box key="logo-box">
                <Text color="cyan">{LOGO}</Text>
            </Box>

            <Box marginTop={1} flexDirection="column" alignItems="center" key="info-box">
                <Text color="gray" dimColor>Brankas Aksara Personal yang Berdikari</Text>
                <Text color="gray" dimColor>v{versi} • Konteks: <Text color="yellow" bold>{konteks.toUpperCase()}</Text></Text>
            </Box>

            <Box marginTop={1} key="loading-box">
                <Text color="gray" dimColor italic>Memuat antarmuka...</Text>
            </Box>
        </Box>
    );
};
