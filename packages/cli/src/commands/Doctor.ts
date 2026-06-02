import { Command } from "commander";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execAsync = promisify(exec);

export function registerDoctorCommand(program: Command) {
  program
    .command("doctor")
    .description("Health check for Lembaranz installation and security")
    .option("--fix", "Attempt to automatically fix detected issues")
    .action(async (options) => {
      console.log("🩺 Lembaranz Doctor: Running diagnostics...\n");

      const issues = [];
      
      // 1. Check .gitignore
      try {
        const gitignorePath = path.join(process.cwd(), ".gitignore");
        const content = await fs.readFile(gitignorePath, "utf8");
        if (!content.includes(".env")) {
          issues.push({ 
            id: "gitignore_env", 
            msg: ".env is not in .gitignore", 
            severity: "HIGH",
            fix: async () => {
              await fs.appendFile(gitignorePath, "\n# Lembaranz: Ignore local env\n.env\n");
              return "Added .env to .gitignore";
            }
          });
        }
        if (!content.includes(".lembaranz")) {
          issues.push({ 
            id: "gitignore_vault", 
            msg: ".lembaranz vault directory is not in .gitignore", 
            severity: "HIGH",
            fix: async () => {
              await fs.appendFile(gitignorePath, "\n# Lembaranz: Ignore local vault\n.lembaranz\n");
              return "Added .lembaranz to .gitignore";
            }
          });
        }
      } catch {
        issues.push({ id: "no_gitignore", msg: ".gitignore file missing", severity: "MEDIUM" });
      }

      // 2. Scan for exposed credentials outside .env
      try {
        const files = await fs.readdir(process.cwd());
        const secretFiles = files.filter(f => f.includes("key") || f.includes("secret") || f.includes("vault") || f.endsWith(".json"));
        for (const f of secretFiles) {
           if (f === "package.json" || f === "package-lock.json" || f === "bun.lock") continue;
           issues.push({ id: "exposed_file", msg: `Potential secret file exposed: ${f}`, severity: "MEDIUM" });
        }
      } catch {}

      if (issues.length === 0) {
        console.log("✅ All systems healthy. No issues detected.");
        return;
      }

      for (const issue of issues) {
        console.log(`[${issue.severity}] ${issue.msg}`);
        if (options.fix && issue.fix) {
          const result = await issue.fix();
          console.log(`   └─ Fixed: ${result}`);
        }
      }

      if (!options.fix) {
        console.log("\nRun 'lembaranz doctor --fix' to attempt automated repairs.");
      }
    });
}
