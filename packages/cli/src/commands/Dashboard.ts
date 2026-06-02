import { Command } from "commander";
import { exec, spawn } from "node:child_process";
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
        
        // Start Vite dev server using spawn for better security
        const child = spawn('bun', ['run', 'dev', '--host', options.host, '--port', String(options.port)], { 
          cwd: dashboardPath,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        child.stdout?.on("data", (data) => {
           if (data.includes("ready in")) {
             console.log("✅ Dashboard is ready.");
           }
           process.stdout.write(data);
        });
        
        child.stderr?.on("data", (data) => {
          process.stderr.write(data);
        });

      } catch (e) {
        console.error("❌ Unexpected error:", e instanceof Error ? e.message : String(e));
      }
    });
}
