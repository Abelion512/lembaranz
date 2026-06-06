import { Command } from "commander";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

/**
 * Register dashboard command
 * Redirects to the modern SPA dashboard in /packages/dashboard
 */
export function registerDashboardCommand(program: Command) {
  program
    .command("dashboard")
    .description("Open Lembaranz Visual Dashboard (E2EE SPA)")
    .option("--host <host>", "Host to run the dashboard server on", "0.0.0.0")
    .option("--port <port>", "Port to run the dashboard server on", "5120")
    .action(async (options) => {
      console.log("🌐 Opening Lembaranz Dashboard...");
      
      const dashboardPath = path.resolve(process.cwd(), "packages", "dashboard");
      
      // Get local network IP for better UX
      const networkInterfaces = os.networkInterfaces();
      let localIp = "127.0.0.1";
      for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        if (networkInterface) {
          for (const iface of networkInterface) {
            if (iface.family === "IPv4" && !iface.internal) {
              localIp = iface.address;
              break;
            }
          }
        }
      }
      
      try {
        console.log(`📂 Dashboard source: ${dashboardPath}`);
        console.log(`⚡ Interface active at:`);
        console.log(`   - Local:   http://localhost:${options.port}`);
        console.log(`   - Network: http://${localIp}:${options.port}`);
        
        // Start Vite dev server
        const proc = spawn("bun", ["run", "dev", "--host", String(options.host), "--port", String(options.port)], {
          cwd: dashboardPath,
          shell: false
        });
        
        proc.stdout?.on("data", (data) => {
           if (data.includes("ready in")) {
             console.log("✅ Dashboard is ready.");
           }
        });

      } catch (e) {
        console.error("❌ Unexpected error:", e instanceof Error ? e.message : String(e));
      }
    });
}
