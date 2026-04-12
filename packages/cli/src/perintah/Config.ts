import { Command } from 'commander';
import { Archive } from '@lembaranz/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { prepareContext, openVaultCLI } from '../utils.js';
import prompts from 'prompts';

export function registerConfigCommand(program: Command) {
  const configCmd = program
    .command('config')
    .description('Manage local .env files across projects (Centralized Vault)');

  configCmd
    .command('save')
    .description('Save the local .env file to the vault')
    .argument('[tag]', 'Project tag name (default: current directory name)')
    .action(async (tag) => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      const targetTag = tag || path.basename(process.cwd());
      const envPath = path.join(process.cwd(), '.env');

      try {
        const content = await fs.readFile(envPath, 'utf8');
        const title = `.env - ${targetTag}`;

        const hasilNotes = await Archive.getAllNotes();
        if (hasilNotes.error) {
          console.error('Failed to read vault:', hasilNotes.error.message);
          return;
        }

        const notes = hasilNotes.data!;
        const existing = notes.find(n => n.title === title && n.tags.includes('env'));

        if (existing) {
          const hasilFull = await Archive.getNoteById(existing.id);
          if (hasilFull.error) {
            console.error('Failed to decrypt .env profile:', hasilFull.error.message);
            return;
          }

          const fullNote = hasilFull.data!;
          fullNote.content = content;
          fullNote.updatedAt = new Date().toISOString();

          const hasilSave = await Archive.saveNote({
            id: fullNote.id,
            title: fullNote.title,
            content: fullNote.content,
            folderId: fullNote.folderId,
            isPinned: fullNote.isPinned,
            isFavorite: fullNote.isFavorite,
            tags: fullNote.tags,
            createdAt: fullNote.createdAt,
            isCredentials: fullNote.isCredentials,
            kredensial: typeof fullNote.kredensial === 'string'
              ? fullNote.kredensial
              : fullNote.kredensial ? JSON.stringify(fullNote.kredensial) : undefined,
          });
          if (hasilSave.error) {
            console.error('Failed to update .env profile:', hasilSave.error.message);
            return;
          }

          console.log(`Successfully updated .env profile: ${targetTag}`);
          return;
        }

        const hasilNew = await Archive.saveNote({
          id: '', title, content,
          folderId: null, isPinned: false, isFavorite: false,
          tags: ['env', targetTag], createdAt: new Date().toISOString()
        });

        if (hasilNew.error) {
          console.error('Failed to store new .env profile:', hasilNew.error.message);
          return;
        }

        console.log(`Successfully stored .env profile: ${targetTag} in the vault.`);
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'ENOENT') {
          console.log('.env file not found in the current directory.');
        } else {
          console.log(`Failed to save: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    });

  configCmd
    .command('load')
    .alias('fetch')
    .description('Load an .env file from the vault to the local directory')
    .argument('<tag>', 'Project tag name')
    .action(async (tag) => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      const title = `.env - ${tag}`;
      const hasilNotes = await Archive.getAllNotes();
      if (hasilNotes.error) {
        return console.log(`Failed to read vault: ${hasilNotes.error.message}`);
      }

      const notes = hasilNotes.data!;
      const existingHeader = notes.find(n => n.title === title && n.tags.includes('env'));

      if (!existingHeader) {
        return console.log(`No .env profile with tag '${tag}' found in the vault.`);
      }

      const hasilFull = await Archive.getNoteById(existingHeader.id);
      if (hasilFull.error) {
        return console.log(`Failed to decrypt .env profile '${tag}': ${hasilFull.error.message}`);
      }

      const fullNote = hasilFull.data!;

      const envPath = path.join(process.cwd(), '.env');
      try {
        // Check if .env file already exists and ask for confirmation
        let shouldOverwrite = true;
        try {
          await fs.access(envPath);
          // File exists, ask for confirmation
          const response = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: '.env file already exists. Overwrite?',
            initial: false
          });
          if (!response.confirm) {
            console.log('Operation cancelled. .env file was not overwritten.');
            return;
          }
        } catch {
          // File doesn't exist, proceed
          shouldOverwrite = true;
        }

        if (shouldOverwrite) {
          await fs.writeFile(envPath, fullNote.content, 'utf8');
          console.log(`Successfully loaded .env profile '${tag}' to ${envPath}`);
        }
      } catch (e: unknown) {
        console.log(`Failed to write .env file: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  configCmd
    .command('list')
    .description('List .env profiles stored in the vault')
    .action(async () => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      const hasilNotes = await Archive.getAllNotes();
      if (hasilNotes.error) {
        return console.log(`Failed to read vault: ${hasilNotes.error.message}`);
      }

      const notes = hasilNotes.data!;
      const envNotes = notes.filter(n => n.tags.includes('env') && n.title.startsWith('.env - '));

      if (envNotes.length === 0) {
        return console.log('No .env profiles stored in the vault yet.');
      }

      console.log('Stored .env Profiles:');
      envNotes.forEach(n => {
        const tag = n.title.replace('.env - ', '');
        console.log(`  - ${tag} (Saved: ${new Date(n.updatedAt || n.createdAt).toLocaleString()})`);
      });
    });

  program
    .command('run')
    .description('Inject environment from vault then execute a sub-command (Zonal Context Injection)')
    .option('-t, --tag <tag>', 'Specific .env profile name (default: directory name)')
    .argument('<command...>', 'Command to execute (e.g., npm start)')
    .allowUnknownOption()
    .action(async (commandArgs, options) => {
      const targetTag = options.tag || path.basename(process.cwd());
      const actualCommand = commandArgs;

      if (!actualCommand || actualCommand.length === 0) {
        return console.log('You must provide a command to run. Example: lembaran run npm start');
      }

      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log('Access denied.');

      const title = `.env - ${targetTag}`;
      const hasilNotes = await Archive.getAllNotes();
      if (hasilNotes.error) {
        return console.log(`Failed to read vault: ${hasilNotes.error.message}`);
      }

      const notes = hasilNotes.data!;
      const existingHeader = notes.find(n => n.title === title && n.tags.includes('env'));

      if (!existingHeader) {
        return console.log(`No .env profile with tag '${targetTag}' found in the vault.`);
      }

      const hasilFull = await Archive.getNoteById(existingHeader.id);
      if (hasilFull.error) {
        return console.log(`Failed to decrypt .env profile '${targetTag}': ${hasilFull.error.message}`);
      }

      const fullNote = hasilFull.data!;

      // Parsing raw .env text to an object
      const parsedEnv: Record<string, string> = {};
      for (const line of fullNote.content.split('\n')) {
        const clean = line.trim();
        if (clean && !clean.startsWith('#')) {
          const index = clean.indexOf('=');
          if (index !== -1) {
            const key = clean.substring(0, index).trim();
            let val = clean.substring(index + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            parsedEnv[key] = val;
          }
        }
      }

      // Filter dangerous environment variables that could enable library injection
      const DANGEROUS_ENV_KEYS = new Set([
        'LD_PRELOAD', 'LD_LIBRARY_PATH', 'DYLD_INSERT_LIBRARIES',
        'DYLD_LIBRARY_PATH', 'NODE_OPTIONS', 'NODE_PATH',
        'BASH_ENV', 'ENV', 'PROMPT_COMMAND'
      ]);

      const safeEnv: Record<string, string> = {};
      for (const [key, val] of Object.entries(parsedEnv)) {
        if (!DANGEROUS_ENV_KEYS.has(key.toUpperCase())) {
          safeEnv[key] = val as string;
        } else {
          console.warn(`⚠️  Stripping dangerous env var: ${key}`);
        }
      }

      // Command string & args
      const cmd = actualCommand[0];
      const args = actualCommand.slice(1);

      console.log(`Injecting isolated context '${targetTag}'...`);

      const child = spawn(cmd, args, {
        stdio: 'inherit',
        shell: false,
        env: { ...process.env, ...safeEnv }
      });

      child.on('error', (err: Error) => {
        console.error(`Failed to execute process: ${err.message}`);
      });

      child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        process.exitCode = code ?? (signal ? 1 : 0);
      });
    });
}
