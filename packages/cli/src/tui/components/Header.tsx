import React from 'react';
import { Box, Text } from 'ink';
import { UI_TOKENS } from '../theme.js';

export const Header: React.FC = () => {
    return (
        <Box flexDirection="column" alignItems="center" marginBottom={1} width="100%">
            <Text color={UI_TOKENS.brand} bold>
            {'\n'}
            {'   ██╗     ███████╗███╗   ███╗██████╗  █████╗ ██████╗  █████╗ ███╗   ██╗███████╗\n'}
            {'   ██║     ██╔════╝████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║╚══███╔╝\n'}
            {'   ██║     █████╗  ██╔████╔██║██████╔╝███████║██████╔╝███████║██╔██╗ ██║  ███╔╝ \n'}
            {'   ██║     ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══██║██╔══██╗██╔══██║██║╚██╗██║ ███╔╝  \n'}
            {'   ███████╗███████╗██║ ╚═╝ ██║██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚████║███████╗\n'}
            {'   ╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝\n'}
            </Text>
            <Text color={UI_TOKENS.meta}>Secure Digital Archive Vault</Text>
        </Box>
    );
};
