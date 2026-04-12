import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { prepareContext, enterTUIScreen, exitTUIScreen } from '../utils.js';

export function registerSecurityCommand(program: Command) {
  program
    .command('security')
    .description('Display the security dashboard')
    .action(async () => {
      await prepareContext(program.opts());
      enterTUIScreen();

      const { LayarKeamanan } = await import('../tui/LayarKeamanan.js');
      const { useApp, Box } = await import('ink');

      const QuickScreen = () => {
        const app = useApp();
        return React.createElement(Box, { flexDirection: 'column', key: 'security-root' },
          React.createElement(LayarKeamanan, { onKembali: () => app.exit(), key: 'security-content' })
        );
      };

      const { waitUntilExit } = render(React.createElement(QuickScreen), { exitOnCtrlC: true });

      try {
        await waitUntilExit();
      } finally {
        exitTUIScreen();
      }
    });
}
