import { Command } from 'commander';
import { Archive } from '@lembaranz/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import prompts from 'prompts';
import { prepareContext, openVaultCLI } from '../utils.js';
import { getImportPathStatErrorMessage } from './ImportErrors.js';

export function registerImportCommand(program: Command) {
  program
    .command('import')
    .description('Import files (.md) or restore backups (.lembaranz)')
    .argument('<path>', 'Directory or file to import')
    .action(async (p) => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      let stats: Awaited<ReturnType<typeof fs.stat>>;
      try {
        stats = await fs.stat(p);
      } catch (err) {
        console.log(getImportPathStatErrorMessage(p, err));
        return;
      }

      const isDir = stats.isDirectory();

      if (!isDir && !stats.isFile()) {
        console.log(`Unsupported path type: "${p}". Use a directory, .md file, or .lembaranz backup.`);
        return;
      }

      // Case 1: Directory (Find .md files)
      if (isDir) {
        const files = (await fs.readdir(p)).filter(f => f.endsWith('.md')).map(f => path.join(p, f));
        console.log(`Importing ${files.length} notes from directory...`);
        for (const f of files) {
            await importMarkdown(f);
        }
        console.log('Done.');
        return;
      }

      // Case 2: .lembaranz file (Restore Backup)
      if (p.endsWith('.lembaranz')) {
        console.log('Detecting portable backup file (.lembaranz)');
        const buffer = await fs.readFile(p);

        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Enter the backup file password:',
        });

        if (!res.pw) return console.log('Cancelled.');

        try {
            console.log('Restoring and re-encrypting data...');
            const result = await Archive.restoreBackup(buffer, res.pw);
            if (result.error) {
                console.error('Failed to restore:', result.error.message);
                return;
            }

            const { restored, skipped } = result.data!;
            console.log(`Restore completed:`);
            console.log(`   - Restored: ${restored} notes`);
            console.log(`   - Skipped (Newer): ${skipped} notes`);
        } catch (err) {
            console.error('Failed to restore:', err instanceof Error ? err.message : err);
        }
        return;
      }

      // Case 3: Single .md file
      if (p.endsWith('.md')) {
          await importMarkdown(p);
          console.log('Done.');
          return;
      }

      console.log('Unsupported file format. Use .md or .lembaranz');
    });
}

async function importMarkdown(filepath: string) {
    const content = await fs.readFile(filepath, 'utf8');
    const title = path.basename(filepath, '.md');
    const result = await Archive.saveNote({
      id: '', title, content,
      folderId: null, isPinned: false, isFavorite: false,
      tags: ['imported'], createdAt: new Date().toISOString()
    });

    if (result.error) {
        console.log(`  Failed to import ${title}: ${result.error.message}`);
    } else {
        console.log(`  ${title}`);
    }
}
