import { Command } from 'commander';
import { Archive } from '@lembaranzz/core';
import fs from 'node:fs/promises';
import prompts from 'prompts';
import { prepareContext, openVaultCLI } from '../utils.js';

export function registerExportCommand(program: Command) {
  program
    .command('export')
    .description('Export all archives to a .lembaranzz file (Portable & Encrypted)')
    .action(async () => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      console.log('Exporting all notes...');

      // Request password specifically for this backup
      const res = await prompts({
          type: 'password',
          name: 'pw',
          message: 'Set a password for this backup (can be the same as vault):',
          validate: (val: string) => val.length > 0 ? true : 'Password must not be empty'
      });

      if (!res.pw) {
          console.log('Export cancelled.');
          return;
      }

      try {
        const result = await Archive.createBackup(res.pw);
        if (result.error) {
          console.error('Failed to export:', result.error.message);
          return;
        }

        const buffer = result.data!;
        const filename = `lembaranzz-export-${new Date().toISOString().split('T')[0]}.lembaranzz`;

        await fs.writeFile(filename, buffer);
        console.log(`Successfully exported to: ${filename}`);
        console.log(`This file is secure and portable. Use the password above to open it on another machine.`);
      } catch (err) {
        console.error('Failed to export:', err);
      }
    });
}
