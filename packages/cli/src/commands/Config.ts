import { Command } from "commander";
import { Archive, Context } from "@lembaranz/core";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { prepareContext, openVaultCLI } from "../utils.js";
import prompts from "prompts";

export function registerConfigCommand(program: Command) {
  const configCmd = program
    .command("config")
    .alias("cfg")
    .description(
      "Manage vault configurations, local environments, and security hooks"
    );

  // --- Local Environment Management (formerly 'settings') ---
  configCmd
    .command("set")
    .description("Set a local environment variable in .env")
    .argument("<key>", "Variable name")
    .argument("<value>", "Variable value")
    .action(async (key, value) => {
      await prepareContext(program.opts());
      const result = await Context.writeEnv(key, value);
      if (result.error) {
        console.error(`Failed to save: ${result.error.message}`);
      } else {
        console.log(`Successfully saved: ${key}=${value}`);
      }
    });

  program
    .command("update")
    .description("Update Lembaranz with local change protection")
    .action(async () => {
      const { execSync } = await import("node:child_process");
      const isGit = await fs.access(path.join(process.cwd(), ".git")).then(() => true).catch(() => false);

      if (isGit) {
        console.log("📦 Dev mode detected. Stashing local changes...");
        try {
          execSync("git stash", { stdio: "inherit" });
          execSync("git pull --rebase", { stdio: "inherit" });
          execSync("git stash pop", { stdio: "inherit" });
          console.log("✅ Local source updated and stashes restored.");
        } catch (e) {
          console.error("❌ Update failed. Resolve conflicts manually.");
        }
      } else {
        console.log("🚀 Updating global binary...");
        execSync("npm install -g lembaranz", { stdio: "inherit" });
      }
    });

  configCmd
    .command("get")
    .description("Get a local environment variable")
    .argument("<key>", "Variable name")
    .action(async (key) => {
      await prepareContext(program.opts());
      const env = await Context.readEnv();
      console.log(`${key}=${env[key] || "(not set)"}`);
    });

  configCmd
    .command("show")
    .description("Show all local configurations")
    .action(async () => {
      await prepareContext(program.opts());
      const env = await Context.readEnv();
      console.log("Local Configuration (.env):");
      Object.entries(env).forEach(([k, v]) => {
        console.log(`  ${k}=${v}`);
      });
    });

  configCmd
    .command("hook")
    .description("Install Git Pre-commit hook to prevent secret leaks")
    .action(async () => {
      const gitHooksPath = path.join(process.cwd(), ".git", "hooks");
      try {
        await fs.access(gitHooksPath);
      } catch {
        return console.log(
          ".git/hooks directory not found. Make sure you are inside a Git repository."
        );
      }

      const hookFile = path.join(gitHooksPath, "pre-commit");
      const hookContent = `#!/bin/bash
# Lembaranz Pre-commit Secret Scanner

echo "Scanning staged files for hardcoded secrets..."

# Common Credential Regex Patterns
P1="AWS_ACCESS_KEY"_"ID"
P2="AWS_SECRET_ACCESS"_"KEY"
P3="-----BEGIN PRIVATE"_" KEY-----"
P4="eyJhbGc"_"iOi"
P5="Bearer [A-Za-z0-9\\-\\._~\\+/]+=*"

PATTERN="($P1|$P2|$P3|$P4|$P5)"

staged_files=$(git diff --cached --name-only --diff-filter=ACM)
has_secrets=0

for file in $staged_files; do
  if git show ":$file" | grep -qE "$PATTERN"; then
    echo "LEAK DETECTED in file: $file"
    has_secrets=1
  fi
done

if [ $has_secrets -eq 1 ]; then
  echo ""
  echo "Lembaranz Security Warning!"
  echo "Commit cancelled due to detected hardcoded secrets."
  echo "Tip: Store environment variables in the vault with: lembaranz config save [tag]"
  echo "     and use Zonal Context Injection: lembaranz run."
  echo ""
  exit 1
fi

echo "Scan clean. Allowing commit."
exit 0
`;
      await fs.writeFile(hookFile, hookContent, { mode: 0o755 });
      return console.log(
        "Successfully installed Lembaranz Pre-commit Secret Scanner."
      );
    });

  // --- Vault Profile Management ---
  configCmd
    .command("save")
    .description("Save the local .env file to the vault")
    .argument("[tag]", "Project tag name (default: current directory name)")
    .action(async (tag) => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log("Access denied.");

      const targetTag = tag || path.basename(process.cwd());
      const envPath = path.join(process.cwd(), ".env");

      try {
        const content = await fs.readFile(envPath, "utf8");
        const title = `.env - ${targetTag}`;

        const notesResult = await Archive.getAllNotes();
        if (notesResult.error) {
          console.error("Failed to read vault:", notesResult.error.message);
          return;
        }

        const notes = notesResult.data!;
        const existing = notes.find(
          (n) => n.title === title && n.tags.includes("env")
        );

        if (existing) {
          const fullResult = await Archive.getNoteById(existing.id);
          if (fullResult.error) {
            console.error(
              "Failed to decrypt .env profile:",
              fullResult.error.message
            );
            return;
          }

          const fullNote = fullResult.data!;
          fullNote.content = content;
          fullNote.updatedAt = new Date().toISOString();

          const saveResult = await Archive.saveNote({
            id: fullNote.id,
            title: fullNote.title,
            content: fullNote.content,
            folderId: fullNote.folderId,
            isPinned: fullNote.isPinned,
            isFavorite: fullNote.isFavorite,
            tags: fullNote.tags,
            createdAt: fullNote.createdAt,
            isCredentials: fullNote.isCredentials,
            credentials:
              typeof fullNote.credentials === "string"
                ? fullNote.credentials
                : fullNote.credentials
                ? JSON.stringify(fullNote.credentials)
                : undefined,
          });
          if (saveResult.error) {
            console.error(
              "Failed to update .env profile:",
              saveResult.error.message
            );
            return;
          }

          console.log(`Successfully updated .env profile: ${targetTag}`);
          return;
        }

        const newResult = await Archive.saveNote({
          id: "",
          title,
          content,
          folderId: null,
          isPinned: false,
          isFavorite: false,
          tags: ["env", targetTag],
          createdAt: new Date().toISOString(),
        });

        if (newResult.error) {
          console.error(
            "Failed to store new .env profile:",
            newResult.error.message
          );
          return;
        }

        console.log(
          `Successfully stored .env profile: ${targetTag} in the vault.`
        );
      } catch (e: unknown) {
        if (e && typeof e === "object" && "code" in e && e.code === "ENOENT") {
          console.log(".env file not found in the current directory.");
        } else {
          console.log(
            `Failed to save: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    });

  configCmd
    .command("load")
    .alias("fetch")
    .description("Load an .env file from the vault to the local directory")
    .argument("<tag>", "Project tag name")
    .action(async (tag) => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log("Access denied.");

      const title = `.env - ${tag}`;
      const notesResult = await Archive.getAllNotes();
      if (notesResult.error) {
        return console.log(
          `Failed to read vault: ${notesResult.error.message}`
        );
      }

      const notes = notesResult.data!;
      const existingHeader = notes.find(
        (n) => n.title === title && n.tags.includes("env")
      );

      if (!existingHeader) {
        return console.log(
          `No .env profile with tag '${tag}' found in the vault.`
        );
      }

      const fullResult = await Archive.getNoteById(existingHeader.id);
      if (fullResult.error) {
        return console.log(
          `Failed to decrypt .env profile '${tag}': ${fullResult.error.message}`
        );
      }

      const fullNote = fullResult.data!;

      const envPath = path.join(process.cwd(), ".env");
      try {
        // Check if .env file already exists and ask for confirmation
        let shouldOverwrite = true;
        try {
          await fs.access(envPath);
          // File exists, ask for confirmation
          const response = await prompts({
            type: "confirm",
            name: "confirm",
            message: ".env file already exists. Overwrite?",
            initial: false,
          });
          if (!response.confirm) {
            console.log("Operation cancelled. .env file was not overwritten.");
            return;
          }
        } catch {
          // File doesn't exist, proceed
          shouldOverwrite = true;
        }

        if (shouldOverwrite) {
          // 🛡️ SECURITY: Enforce restrictive permissions to prevent CWE-732
          await fs.writeFile(envPath, fullNote.content, { encoding: "utf8", mode: 0o600 });
          console.log(
            `Successfully loaded .env profile '${tag}' to ${envPath}`
          );
        }
      } catch (e: unknown) {
        console.log(
          `Failed to write .env file: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    });

  configCmd
    .command("list")
    .description("List .env profiles stored in the vault")
    .action(async () => {
      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log("Access denied.");

      const notesResult = await Archive.getAllNotes();
      if (notesResult.error) {
        return console.log(
          `Failed to read vault: ${notesResult.error.message}`
        );
      }

      const notes = notesResult.data!;
      const envNotes = notes.filter(
        (n) => n.tags.includes("env") && n.title.startsWith(".env - ")
      );

      if (envNotes.length === 0) {
        return console.log("No .env profiles stored in the vault yet.");
      }

      console.log("Stored .env Profiles:");
      envNotes.forEach((n) => {
        const tag = n.title.replace(".env - ", "");
        console.log(
          `  - ${tag} (Saved: ${new Date(
            n.updatedAt || n.createdAt
          ).toLocaleString()})`
        );
      });
    });

  program
    .command("run")
    .description(
      "Inject environment from vault then execute a sub-command (Zonal Context Injection)"
    )
    .option(
      "-t, --tag <tag>",
      "Specific .env profile name (default: directory name)"
    )
    .argument("<command...>", "Command to execute (e.g., npm start)")
    .allowUnknownOption()
    .action(async (commandArgs, options) => {
      const targetTag = options.tag || path.basename(process.cwd());
      const actualCommand = commandArgs;

      if (!actualCommand || actualCommand.length === 0) {
        return console.log(
          "You must provide a command to run. Example: lembaranz run npm start"
        );
      }

      await prepareContext(program.opts());
      if (!(await openVaultCLI())) return console.log("Access denied.");

      const title = `.env - ${targetTag}`;
      const notesResult = await Archive.getAllNotes();
      if (notesResult.error) {
        return console.log(
          `Failed to read vault: ${notesResult.error.message}`
        );
      }

      const notes = notesResult.data!;
      const existingHeader = notes.find(
        (n) => n.title === title && n.tags.includes("env")
      );

      if (!existingHeader) {
        return console.log(
          `No .env profile with tag '${targetTag}' found in the vault.`
        );
      }

      const fullResult = await Archive.getNoteById(existingHeader.id);
      if (fullResult.error) {
        return console.log(
          `Failed to decrypt .env profile '${targetTag}': ${fullResult.error.message}`
        );
      }

      const fullNote = fullResult.data!;

      // Parsing raw .env text to an object
      const parsedEnv: Record<string, string> = {};
      for (const line of fullNote.content.split("\n")) {
        const clean = line.trim();
        if (clean && !clean.startsWith("#")) {
          const index = clean.indexOf("=");
          if (index !== -1) {
            let key = clean.substring(0, index).trim();
            if (key.startsWith("export ")) {
              key = key.substring(7).trim();
            }

            // Validate key against standard POSIX convention
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              console.warn(
                `⚠️  Skipping invalid environment variable key: ${key}`
              );
              continue;
            }

            let val = clean.substring(index + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.substring(1, val.length - 1);
            }

            // Sanitize value by stripping out non-whitespace control characters
            // eslint-disable-next-line no-control-regex
            val = val.replace(/[\x00-\x1F\x7F]/g, "");

            parsedEnv[key] = val;
          }
        }
      }

      // Filter dangerous environment variables that could enable library injection or alter runtime behavior
      const DANGEROUS_ENV_KEYS = new Set([
        // Dynamic Linker / Library Injection
        "LD_PRELOAD",
        "LD_LIBRARY_PATH",
        "LD_AUDIT",
        "LD_DEBUG",
        "LD_PROFILE",
        "LD_USE_LOAD_BIAS",
        "LD_ORIGIN_PATH",
        "DYLD_INSERT_LIBRARIES",
        "DYLD_LIBRARY_PATH",
        "DYLD_FRAMEWORK_PATH",
        "DYLD_FALLBACK_LIBRARY_PATH",
        "DYLD_FALLBACK_FRAMEWORK_PATH",
        "DYLD_PRINT_TO_FILE",
        "DYLD_FORCE_FLAT_NAMESPACE",

        // Language Runtimes
        "NODE_OPTIONS",
        "NODE_PATH",
        "NODE_ICU_DATA",
        "NODE_REPL_HISTORY",
        "PYTHONPATH",
        "PYTHONHOME",
        "PYTHONSTARTUP",
        "PYTHONINSPECT",
        "RUBYLIB",
        "RUBYOPT",
        "PERL5LIB",
        "PERL5OPT",
        "PERLIO_DEBUG",
        "JAVA_TOOL_OPTIONS",
        "_JAVA_OPTIONS",

        // Shell & Execution
        "BASH_ENV",
        "ENV",
        "PROMPT_COMMAND",
        "IFS",
        "PS1",
        "PS2",
        "PS3",
        "PS4",

        // System & Security
        "GCONV_PATH",
        "GETCONF_DIR",
        "HOSTALIASES",
        "MALLOC_CHECK_",
        "MALLOC_PERTURB_",
        "RESOLV_HOST_CONF",
        "RES_OPTIONS",
        "TERMINFO",
        "TERMINFO_DIRS",
        "TERMCAP",
      ]);

      const safeEnv: Record<string, string> = {};
      const VALID_KEY_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      // eslint-disable-next-line no-control-regex
      const controlCharRegex = /[\x00-\x1F\x7F]/g;

      for (const [key, val] of Object.entries(parsedEnv)) {
        const upperKey = key.toUpperCase();

        // 1. Validate key format
        if (!VALID_KEY_REGEX.test(key)) {
          console.warn(`⚠️  Stripping malformed env var key: ${key}`);
          continue;
        }

        // 2. Check blocklist
        if (DANGEROUS_ENV_KEYS.has(upperKey)) {
          console.warn(`⚠️  Stripping dangerous env var: ${key}`);
          continue;
        }

        // 3. Sanitize value (strip non-whitespace control characters)
        const sanitizedVal = (val as string).replace(controlCharRegex, "");

        if (sanitizedVal !== val) {
          console.warn(`⚠️  Sanitized control characters from env var: ${key}`);
        }

        safeEnv[key] = sanitizedVal;
      }

      // Command string & args
      const cmd = actualCommand[0];
      const args = actualCommand.slice(1);

      console.log(`Injecting isolated context '${targetTag}'...`);

      const child = spawn(cmd, args, {
        stdio: "inherit",
        shell: false,
        env: { ...process.env, ...safeEnv },
      });

      child.on("error", (err: Error) => {
        console.error(`Failed to execute process: ${err.message}`);
      });

      child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
        process.exitCode = code ?? (signal ? 1 : 0);
      });
    });
}
