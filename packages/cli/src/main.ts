#!/usr/bin/env bun
import { program } from "commander";
import { registerConfigCommand } from "./commands/Config.js";
import { registerImportCommand } from "./commands/Import.js";
import { registerExportCommand } from "./commands/Export.js";
import { registerMonitorCommand } from "./commands/Monitor.js";
import { registerSecurityCommand } from "./commands/Security.js";
import { registerBrowseCommand } from "./commands/Browse.js";
import { registerLaunchCommand, runTUI } from "./commands/Launch.js";
import { registerSetupCommand } from "./commands/Setup.js";
import { registerDoctorCommand } from "./commands/Doctor.js";
import { registerDashboardCommand } from "./commands/Dashboard.js";
import { prepareContext } from "./utils.js";
import pkg from "../package.json" with { type: "json" };

// Global error handling
process.on("unhandledRejection", (reason) => {
  console.error("\x1b[35m\n[FATAL ERROR] Unhandled Rejection:\x1b[0m", reason);
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.error("\x1b[35m\n[FATAL ERROR] Uncaught Exception:\x1b[0m", error);
  process.exit(1);
});

const VERSI = pkg.version;

program
  .name("lembaranz")
  .description("Lembaranz -- Personal Digital Archive Vault (CLI)")
  .version(VERSI);

// Global Flags
program
  .option("--personal", "Use personal vault context (global)")
  .option("--project", "Use project vault context (local)");

// Register all commands
registerSetupCommand(program);
registerConfigCommand(program);
registerDoctorCommand(program);
registerDashboardCommand(program);
registerImportCommand(program);
registerExportCommand(program);
registerMonitorCommand(program, VERSI);
registerSecurityCommand(program);
registerBrowseCommand(program, VERSI);
registerLaunchCommand(program, VERSI);

// Default action: TUI or Smart Forwarding to 'run'
program.action(async (_options, command) => {
  const args = command.args || [];

  if (args.length > 0) {
    // ⚡ Bolt: Smart Forwarding to 'run' command
    // If user types `lembaranz npm start`, we forward it to the injection logic.
    const runCmd = program.commands.find(
      (c) => c.name() === "run" || c.alias() === "run"
    );
    if (runCmd) {
      runCmd.parse(["run", ...args], { from: "user" });
      return;
    }
  }

  // Default: full interactive TUI
  const context = await prepareContext(program.opts());
  await runTUI(context, VERSI);
});

program.parse(process.argv);
