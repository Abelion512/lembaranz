import { Command } from 'commander';
import { VaultContext } from '@lembaranz/core';
import React from 'react';
import { render } from 'ink';
import { prepareContext, enterTUIScreen, exitTUIScreen } from '../utils.js';

export const runTUI = async (context: VaultContext, versi: string, initialScreen?: string, initialFilter?: string) => {
    enterTUIScreen();

    // Dynamic import
    const { Aplikasi } = await import('../tui/Aplikasi.js');

    const { waitUntilExit } = render(
        React.createElement(Aplikasi, { context, versi, initialScreen: initialScreen as any, initialFilter: initialFilter }),
        { exitOnCtrlC: false } // Handle in Aplikasi.tsx
    );

    try {
        await waitUntilExit();
    } finally {
        exitTUIScreen();
    }
};

export function registerLaunchCommand(program: Command, versi: string) {
    program
        .command('launch')
        .description('Launch the interactive Terminal User Interface (TUI)')
        .action(async () => {
            const context = await prepareContext(program.opts());
            await runTUI(context, versi);
        });
}
