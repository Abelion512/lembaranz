import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { siapkanKonteks, masukLayarTUI, keluarLayarTUI } from '../utils.js';

export function registrasiPerintahPantau(program: Command, versi: string) {
  program
    .command('pantau')
    .description('Memantau kesehatan dan integritas sistem')
    .action(async () => {
      const konteks = await siapkanKonteks(program.opts());
      masukLayarTUI();

      const { LayarPantau } = await import('../tui/LayarPantau.js');
      const { BarStatus } = await import('../tui/BarStatus.js');
      const { useApp, Box } = await import('ink');

      const LayarCepat = () => {
        const app = useApp();
        return React.createElement(Box, { flexDirection: 'column', key: 'pantau-root' },
          React.createElement(Box, { flexDirection: 'column', marginBottom: 1, key: 'pantau-content' },
            React.createElement(LayarPantau, { konteks, onKembali: () => app.exit() })
          ),
          React.createElement(BarStatus, { konteks, versi, layar: 'Pantau', key: 'pantau-bar' })
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
