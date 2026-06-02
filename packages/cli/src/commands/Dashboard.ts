import { Command } from "commander";
import { exec } from "node:child_process";
import path from "node:path";

/**
 * Register dashboard command
 * Redirects to the modern SPA dashboard in /packages/dashboard
 */
export function registerDashboardCommand(program: Command) {
  program
    .command("dashboard")
    .description("Open Lembaranz Visual Dashboard (E2EE SPA)")
    .option("--host <host>", "Host to run the dashboard server on", "0.0.0.0")
    .option("--port <port>", "Port to run the dashboard server on", "3000")
    .action(async (options) => {
      console.log("🌐 Opening Lembaranz Dashboard...");
      
      const dashboardPath = path.resolve(process.cwd(), "packages", "dashboard");
      
      try {
        console.log(`📂 Dashboard source: ${dashboardPath}`);
        console.log(`⚡ Starting interface on http://${options.host}:${options.port}...`);
        
        exec(`bun run dev --host ${options.host} --port ${options.port}`, { cwd: dashboardPath }, (error) => {
          if (error) {
            console.error(`❌ Failed to launch dashboard: ${error.message}`);
          }
        });

      } catch (e) {
        console.error("❌ Unexpected error:", e instanceof Error ? e.message : String(e));
      }
    });
}
