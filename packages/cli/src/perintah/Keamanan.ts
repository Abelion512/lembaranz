import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { siapkanKonteks, masukLayarTUI, keluarLayarTUI } from '../utils.js';

export function registrasiPerintahKeamanan(program: Command) {
  program
    .command('keamanan')
    .description('Menampilkan dashboard keamanan')
    .action(async () => {
      await siapkanKonteks(program.opts());
      masukLayarTUI();

      const { LayarKeamanan } = await import('../tui/LayarKeamanan.js');
      const { useApp, Box } = await import('ink');

      const LayarCepat = () => {
        const app = useApp();
        return React.createElement(Box, { flexDirection: 'column', key: 'keamanan-root' },
          React.createElement(LayarKeamanan, { onKembali: () => app.exit(), key: 'keamanan-content' })
        );
      };

      const { waitUntilExit } = render(React.createElement(LayarCepat), { exitOnCtrlC: true });

      try {
        await waitUntilExit();
      } finally {
        keluarLayarTUI();
      }
    });
}
