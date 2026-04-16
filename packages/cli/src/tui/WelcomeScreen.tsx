import React from 'react';
import { Box, Text } from 'ink';
import { UI_TOKENS } from './theme.js';

interface WelcomeScreenProps {
  versi: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ versi, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" padding={2} width="100%">
      <Text color={UI_TOKENS.brand} bold>
      {'\n'}
      {'   ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗███████╗\n'}
      {'   ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║╚══███╔╝\n'}
      {'   ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║  ███╔╝ \n'}
      {'   ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║ ███╔╝  \n'}
      {'   ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║███████╗\n'}
      {'   ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝\n'}
      </Text>

      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text color={UI_TOKENS.meta}>v{versi} • Secure Archive Vault</Text>
      </Box>

      <Box marginTop={2}>
        <Text color={UI_TOKENS.accent} dimColor italic>Initializing secure environment...</Text>
      </Box>
    </Box>
  );
};
