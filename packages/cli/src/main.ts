#!/usr/bin/env bun
import { program } from 'commander';
import { registerConfigCommand } from './commands/Config.js';
import { registerImportCommand } from './commands/Import.js';
import { registerExportCommand } from './commands/Export.js';
import { registerMonitorCommand } from './commands/Monitor.js';
import { registerSecurityCommand } from './commands/Security.js';
import { registerBrowseCommand } from './commands/Browse.js';
import { registerLaunchCommand, runTUI } from './commands/Launch.js';
import { registerSetupCommand } from './commands/Setup.js';
import { prepareContext } from './utils.js';
import pkg from '../package.json' assert { type: 'json' };

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error('\x1b[35m\n[FATAL ERROR] Unhandled Rejection:\x1b[0m', reason);
});
process.on('uncaughtException', (error) => {
  console.error('\x1b[35m\n[FATAL ERROR] Uncaught Exception:\x1b[0m', error);
});

const VERSI = pkg.version;

program
  .name('lembaranz')
  .description('Lembaranz -- Personal Digital Archive Vault (CLI)')
  .version(VERSI);

// Global Flags
program
  .option('--personal', 'Use personal vault context (global)')
  .option('--project', 'Use project vault context (local)');

// Register all commands
registerSetupCommand(program);
registerConfigCommand(program);
registerImportCommand(program);
registerExportCommand(program);
registerMonitorCommand(program, VERSI);
registerSecurityCommand(program);
registerBrowseCommand(program, VERSI);
registerLaunchCommand(program, VERSI);

// Default: full interactive TUI
program.action(async () => {
  const context = await prepareContext(program.opts());
  await runTUI(context, VERSI);
});

program.parse(process.argv);
