#!/usr/bin/env bun
import { program } from 'commander';
import { registerConfigCommand } from './commands/Config.js';
import { registerImportCommand } from './commands/Import.js';
import { registerExportCommand } from './commands/Export.js';
import { registerSettingsCommand } from './commands/Settings.js';
import { registerMonitorCommand } from './commands/Monitor.js';
import { registerSecurityCommand } from './commands/Security.js';
import { registerBrowseCommand } from './commands/Browse.js';
import { registerLaunchCommand, runTUI } from './commands/Launch.js';
import { registerSetupCommand } from './commands/Setup.js';
import { prepareContext } from './utils.js';
import pkg from '../package.json' assert { type: 'json' };

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error('\nFatal error (Rejection):', reason);
});
process.on('uncaughtException', (error) => {
  console.error('\nFatal error (Exception):', error);
});

const VERSI = pkg.version;

program
  .name('lembaran')
  .description('Lembaran -- Personal Script Management CLI')
  .version(VERSI)
  .option('--saku', 'Use personal vault context (global)')
  .option('--pelataran', 'Use project vault context (local)');

// Register all commands
registerSetupCommand(program);
registerConfigCommand(program);
registerImportCommand(program);
registerExportCommand(program);
registerSettingsCommand(program);
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
