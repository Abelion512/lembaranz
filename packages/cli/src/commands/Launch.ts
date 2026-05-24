import { Command } from 'commander';
import { VaultContext } from '@lembaranzz/core';
import React from 'react';
import { render } from 'ink';
import { prepareContext, enterTUIScreen, exitTUIScreen } from '../utils.js';

export const runTUI = async (context: VaultContext, versi: string, initialScreen?: string, initialFilter?: string) => {
    enterTUIScreen();

    const { App } = await import('../tui/App.js');

    const { waitUntilExit } = render(
        React.createElement(App, { context, versi, initialScreen: initialScreen as any, initialFilter }),
        { exitOnCtrlC: false }
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
