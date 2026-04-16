import { Command } from 'commander';
import { prepareContext, openVaultCLI } from '../utils.js';
import { runTUI } from './Launch.js';

export function registerBrowseCommand(program: Command, versi: string) {
  program
    .command('browse [keyword]')
    .description('Search notes in the archive using a keyword')
    .action(async (keyword) => {
      // 1. Prepare context (saku/pelataran)
      const context = await prepareContext(program.opts());

      // 2. Open vault (Required to access archive)
      console.log('Opening vault to access archive...');
      const success = await openVaultCLI();

      if (!success) {
        console.log('Failed to open vault. Search cancelled.');
        return;
      }

      // 3. Launch TUI directly to the Browse screen with keyword filter
      await runTUI(context, versi, 'browse', keyword);
    });
}
