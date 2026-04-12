#!/usr/bin/env bun
import { program } from 'commander';
import { registerConfigCommand } from './perintah/Config.js';
import { registerImportCommand } from './perintah/Import.js';
import { registerExportCommand } from './perintah/Export.js';
import { registerSettingsCommand } from './perintah/Settings.js';
import { registerMonitorCommand } from './perintah/Monitor.js';
import { registerSecurityCommand } from './perintah/Security.js';
import { registerBrowseCommand } from './perintah/Browse.js';
import { registerLaunchCommand, runTUI } from './perintah/Launch.js';
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
  const konteks = await prepareContext(program.opts());
  await runTUI(konteks, VERSI);
});

program.parse(process.argv);
