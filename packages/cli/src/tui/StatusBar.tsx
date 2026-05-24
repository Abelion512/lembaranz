import React from 'react';
import { Box, Text } from 'ink';
import { UI_TOKENS } from './theme.js';

interface StatusBarProps {
  context: string;
  versi: string;
  screen?: string;
  isLocked?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ context, versi, screen, isLocked }) => {
  return (
    <Box borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1} justifyContent="space-between" width="100%">
      <Box shadow="single">
        <Text color={UI_TOKENS.brand} bold>LEMBARANZZ</Text>
        <Text color={UI_TOKENS.meta}> v{versi}</Text>
      </Box>

      {screen && (
          <Text color={UI_TOKENS.meta} bold> [ {screen.toUpperCase()} ] </Text>
      )}

      <Box>
        <Text color={isLocked ? UI_TOKENS.danger : UI_TOKENS.accent} bold>
          {isLocked ? 'LOCKED' : 'SECURE'}
        </Text>
        <Text color={UI_TOKENS.meta} dimColor> • </Text>
        <Text color={UI_TOKENS.brand} bold>{context.toUpperCase()}</Text>
        <Text color={UI_TOKENS.meta} dimColor> • q:exit</Text>
      </Box>
    </Box>
  );
};
