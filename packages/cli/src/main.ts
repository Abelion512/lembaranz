#!/usr/bin/env bun
/**
 * CLI entry point.
 *
 * Builds the Commander program and dispatches to the TUI by default. Fatal
 * errors exit non-zero so a failure in a script or CI step is never mistaken
 * for success.
 *
 * `buildProgram` is exported and `parse` only runs under `import.meta.main` so
 * a test can inspect the registered command surface without the module parsing
 * the test runner's argv. That distinction matters: `docs/en/cli.md` and the
 * PRD both list these commands, and the test that holds them honest has to read
 * the real registration rather than the documentation that claims it.
 */
import { Command } from "commander";
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
import { registerServerCommand } from "./commands/Server.js";
import { prepareContext } from "./utils.js";
import pkg from "../package.json" with { type: "json" };

const VERSI = pkg.version;

export function buildProgram(version: string = VERSI): Command {
  const program = new Command();

  program
    .name("lembaranz")
    .description("Lembaranz -- Personal Digital Archive Vault (CLI)")
    .version(version);

  // Global Flags
  program
    .option("--personal", "Use personal vault context (global)")
    .option("--project", "Use project vault context (local)");

  // Register all commands
  registerSetupCommand(program);
  registerConfigCommand(program);
  registerDoctorCommand(program);
  registerDashboardCommand(program);
  registerServerCommand(program);
  registerImportCommand(program);
  registerExportCommand(program);
  registerMonitorCommand(program, version);
  registerSecurityCommand(program);
  registerBrowseCommand(program, version);
  registerLaunchCommand(program, version);

  // Default action: TUI, or forward an unknown first token to `config run`.
  program.action(async (_options, command) => {
    const args = command.args || [];

    if (args.length > 0) {
      // Smart forwarding: `lembaranz npm start` runs the project through the
      // vault's .env loader.
      const runCmd = program.commands.find(
        (c) => c.name() === "run" || c.alias() === "run"
      );
      if (runCmd) {
        runCmd.parse(["run", ...args], { from: "user" });
        return;
      }
    }

    const context = await prepareContext(program.opts());
    await runTUI(context, version);
  });

  return program;
}

// Global error handling. Only installed when this file is the entry point: a
// test that imports `buildProgram` must not have its process error handlers
// replaced underneath it.
if (import.meta.main) {
  process.on("unhandledRejection", (reason) => {
    console.error("\x1b[35m\n[FATAL ERROR] Unhandled Rejection:\x1b[0m", reason);
    process.exit(1);
  });
  process.on("uncaughtException", (error) => {
    console.error("\x1b[35m\n[FATAL ERROR] Uncaught Exception:\x1b[0m", error);
    process.exit(1);
  });

  buildProgram().parse(process.argv);
}