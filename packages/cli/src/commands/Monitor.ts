import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { prepareContext, enterTUIScreen, exitTUIScreen } from '../utils.js';

export function registerMonitorCommand(program: Command, versi: string) {
  program
    .command('monitor')
    .description('Monitor system health and integrity')
    .action(async () => {
      const context = await prepareContext(program.opts());
      enterTUIScreen();

      const { LayarPantau } = await import('../tui/LayarPantau.js');
      const { BarStatus } = await import('../tui/BarStatus.js');
      const { useApp, Box } = await import('ink');

      const QuickScreen = () => {
        const app = useApp();
        return React.createElement(Box, { flexDirection: 'column', key: 'monitor-root' },
          React.createElement(Box, { flexDirection: 'column', marginBottom: 1, key: 'monitor-content' },
            React.createElement(LayarPantau, { context, onBack: () => app.exit() })
          ),
          React.createElement(BarStatus, { context, versi, screen: 'Monitor', key: 'monitor-bar' })
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
