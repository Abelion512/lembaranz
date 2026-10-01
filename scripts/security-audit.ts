import { readdir, stat, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const BLACKLIST_PATTERNS = [
  /\.env(\.local)?$/,
  /vault\.json$/,
  /\.lembaranz$/,
  /credentials\.json$/,
  /tokens\.json$/,
  /\.key$/,
  /\.pem$/
];

async function scanDirectory(dir: string): Promise<string[]> {
  const leaks: string[] = [];
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (file === "node_modules" || file === ".git" || file === "dist" || file === ".next") {
        continue;
      }
      
      const fullPath = join(dir, file);
      const fileStat = await stat(fullPath);

      // Check against blacklist patterns
      for (const pattern of BLACKLIST_PATTERNS) {
        if (pattern.test(file)) {
          leaks.push(fullPath);
        }
      }

      if (fileStat.isDirectory()) {
        const subLeaks = await scanDirectory(fullPath);
        leaks.push(...subLeaks);
      }
    }
  } catch {
    // Directory might not exist or be readable, skip
  }
  return leaks;
}

async function runSecurityAudit() {
  console.log("\x1b[36m[SECURITY AUDIT] Scanning for sensitive files before publish...\x1b[0m");

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const corePath = join(currentDir, "../packages/core");
  const cliPath = join(currentDir, "../packages/cli");
  
  const leaksCore = await scanDirectory(corePath);
  const leaksCli = await scanDirectory(cliPath);
  const leaks = [...leaksCore, ...leaksCli];

  if (leaks.length > 0) {
    console.error("\x1b[31m\n[SECURITY ALERT] Sensitive files detected!\x1b[0m");
    console.error("The following files must not be published to the npm registry:");
    leaks.forEach(leak => {
      console.error(`  - \x1b[33m${leak}\x1b[0m`);
    });
    console.error("\x1b[31m\nPublishing aborted automatically for security.\x1b[0m\n");
    process.exit(1);
  }

  // Double check packages/dashboard/package.json is private
  try {
    const dashboardPkgPath = join(currentDir, "../packages/dashboard/package.json");
    const dashboardPkgRaw = await readFile(dashboardPkgPath, "utf-8");
    const dashboardPkg = JSON.parse(dashboardPkgRaw);
    if (dashboardPkg.private !== true) {
      console.error("\x1b[31m[SECURITY ALERT] Package 'dashboard' must be set to 'private: true'!\x1b[0m");
      process.exit(1);
    }
  } catch {
    // If doesn't exist, it's fine
  }

  console.log("\x1b[32m[SECURITY AUDIT PASS] Clean. No sensitive files found in the publishable packages.\x1b[0m\n");
}

runSecurityAudit();
