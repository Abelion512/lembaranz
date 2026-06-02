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
    .action(async () => {
      console.log("🌐 Opening Lembaranz Dashboard...");
      
      const dashboardPath = path.resolve(process.cwd(), "packages", "dashboard");
      
      try {
        // Start local dev server (Vite) and open browser
        // In production, this should point to a built dist or hosted URL
        console.log(`📂 Dashboard source: ${dashboardPath}`);
        console.log("⚡ Starting local interface...");
        
        exec("bun run dev", { cwd: dashboardPath }, (error) => {
          if (error) {
            console.error(`❌ Failed to launch dashboard: ${error.message}`);
          }
        });

      } catch (e) {
        console.error("❌ Unexpected error:", e instanceof Error ? e.message : String(e));
      }
    });
}
