import { Command } from 'commander';
import { Context } from '@lembaranz/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prepareContext } from '../utils.js';

export function registerSettingsCommand(program: Command) {
  program
    .command('settings')
    .description('Manage local environment variables (.env) or repository settings')
    .option('--install-hook', 'Install Git Pre-commit hook to prevent secret leaks')
    .argument('[key]', 'Variable name (key)')
    .argument('[value]', 'Variable value')
    .action(async (key, value, options) => {
      if (options.installHook) {
        const gitHooksPath = path.join(process.cwd(), '.git', 'hooks');
        try {
          await fs.access(gitHooksPath);
        } catch {
          return console.log('.git/hooks directory not found. Make sure you are inside a Git repository.');
        }

        const hookFile = path.join(gitHooksPath, 'pre-commit');
        const hookContent = `#!/bin/bash
# Lembaran Pre-commit Secret Scanner

echo "Scanning staged files for hardcoded secrets..."

# Common Credential Regex Patterns (Obfuscated from self-detection)
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
  echo "Lembaran Security Warning!"
  echo "Commit cancelled due to detected hardcoded secrets."
  echo "Tip: Store environment variables in the vault with: lembaran config save [tag]"
  echo "     and use Zonal Context Injection: lembaran run."
  echo ""
  exit 1
fi

echo "Scan clean. Allowing commit."
exit 0
`;
        await fs.writeFile(hookFile, hookContent, { mode: 0o755 });
        return console.log('Successfully installed Lembaran Pre-commit Secret Scanner in this directory.');
      }

      await prepareContext(program.opts());

      if (key && value !== undefined) {
        const result = await Context.writeEnv(key, value);
        if (result.error) {
          console.error(`Failed to save: ${result.error.message}`);
        } else {
          console.log(`Successfully saved: ${key}=${value}`);
        }
      } else if (key) {
        const env = await Context.readEnv();
        console.log(`${key}=${env[key] || '(not set)'}`);
      } else {
        const env = await Context.readEnv();
        console.log('Local Configuration (.env):');
        Object.entries(env).forEach(([k, v]) => {
          console.log(`  ${k}=${v}`);
        });
      }
    });
}
