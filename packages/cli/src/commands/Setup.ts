import { Command } from 'commander';
import prompts from 'prompts';
import { Archive } from '@lembaranz/core';
import { generateMnemonic } from '@lembaranz/core';
import { prepareContext } from '../utils.js';
import pc from 'picocolors';
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';


export function registerSetupCommand(program: Command) {
  program
    .command('setup')
    .alias('init')
    .description('Interactive setup wizard (CLI or GUI)')
    .action(async () => {
      console.log(pc.bold('\n🚀 Lembaranz Setup Wizard'));
      console.log(pc.dim('Set up your secure credential vault.\n'));

      try {
        // Security Remediation: Clean up any legacy plaintext progress files left over from older versions
        try {
          const progressDir = path.join(process.cwd(), '.lembaranz');
          const progressFile = path.join(progressDir, 'setup-progress.json');
          await fs.unlink(progressFile);
        } catch {
          // Ignore if the legacy file does not exist
        }

        await prepareContext(program.opts());

        const { mode } = await prompts({
          type: 'select',
          name: 'mode',
          message: 'Choose setup mode:',
          choices: [
            { title: '⌨️   CLI — Terminal wizard', value: 'cli' },
            // { title: '🖥️  GUI — Web interface (localhost:1401)', value: 'gui' }, // Disabled: Refactoring in progress
          ],
        });

        if (mode === 'gui') {
          await launchGUI();
        } else {
          await runCLISetup(program);
        }
      } catch (error) {
        console.log(pc.red('\n✗ Setup failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}

async function launchGUI() {
  const webDir = path.join(process.cwd(), 'packages', 'web');
  try { await fs.access(webDir); } catch {
    console.log(pc.red('\n✗ Web package not found. Run from monorepo root.\n'));
    return;
  }

  // Kill zombie bun/next processes before starting GUI
  try {
    // Kill all bun run start/dev processes (catches zombies that lsof misses)
    execSync('pgrep -f "bun.*dev|bun.*start|next-server" | xargs kill -9 2>/dev/null || true');
    execSync('sleep 1');
    // Fallback: kill anything on port 1401
    execSync('lsof -ti:1401 2>/dev/null | xargs kill -9 2>/dev/null || true');
    execSync('sleep 1');
  } catch {
    // Ignore kill errors
  }

  console.log(pc.cyan('\n🖥️  Starting GUI on http://localhost:1401\n'));
  console.log(pc.yellow('⚠️  Keep this terminal open!'));
  console.log(pc.dim('The vault manager will open in your browser.\n'));

  const child = spawn('bun', ['run', 'dev'], { cwd: webDir, stdio: 'inherit', shell: false });
  
  child.on('error', (err) => {
    console.error(pc.red('❌ Failed to start GUI server:'), err.message);
  });

  await prompts({ type: 'text', name: '_', message: 'Press Enter to stop GUI server:', initial: '' });
  child.kill();
  console.log(pc.green('\n✓ GUI server stopped.\n'));
}

async function runCLISetup(program: Command) {
  try {
    // Step 0: Check if vault already exists
    const vaultExists = await Archive.isVaultSetup();
    if (vaultExists) {
      console.log(pc.yellow('\n⚠️  Vault already exists!'));
      const { action } = await prompts({
        type: 'select',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { title: '🔓 Unlock existing vault', value: 'unlock' },
          { title: '🗑️  Destroy and create new (⚠️ DELETES ALL DATA)', value: 'destroy' },
          { title: '❌ Cancel', value: 'cancel' }
        ]
      });

      if (action === 'cancel' || !action) return;
      if (action === 'destroy') {
        const { confirm } = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: pc.red('Are you sure? This will delete ALL your credentials!'),
          initial: false
        });
        if (!confirm) return;
        await Archive.destroyAllData();
        console.log(pc.green('✓ Old vault destroyed'));
      } else {
        await unlockVaultInteractive();
        return;
      }
    }

    // Clean up any legacy setup-progress.json files to prevent data leaks
    await clearProgress();

    // Step 1: Create password
    console.log(pc.cyan('\n📝 Step 1/3: Create Your Master Password'));
    console.log(pc.dim('This password protects all your credentials. Make it strong!\n'));

    let password = '';
    let confirmed = false;

    while (!confirmed) {
      const passwordResult = await prompts({
        type: 'password',
        name: 'password',
        message: 'Enter a strong password (min 8 chars, mix of letters/numbers):',
        validate: (val: string) => {
          if (val.length < 8) return 'Password must be at least 8 characters';
          if (!/[A-Za-z]/.test(val)) return 'Password must contain at least one letter';
          if (!/[0-9]/.test(val)) return 'Password must contain at least one number';
          return true;
        }
      });

      if (!passwordResult.password) {
        console.log(pc.red('\n✗ Setup cancelled'));
        return;
      }

      const confirmResult = await prompts({
        type: 'password',
        name: 'confirm',
        message: 'Confirm password:',
        validate: (val: string) => val === passwordResult.password ? true : 'Passwords do not match'
      });

      if (!confirmResult.confirm) {
        console.log(pc.yellow('\n✗ Passwords do not match. Try again.\n'));
        continue;
      }

      password = passwordResult.password;
      confirmed = true;
    }

    // Step 2+: Recovery phrase and beyond
    await runStep2AndBeyond(password, program);

  } catch (error) {
    console.log(pc.red('\n✗ Setup failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runStep2AndBeyond(password: string, _program: Command) {
  try {
    const mnemonic = generateMnemonic(12);
    const words = mnemonic.split(' ');

    // Step 2: Display recovery phrase
    console.log(pc.cyan('\n🔑 Step 2/3: Your Recovery Phrase'));
    console.log(pc.yellow('\n⚠️  IMPORTANT: Write these 12 words on PAPER!'));
    console.log(pc.dim("If you forget your password, these 12 words are the ONLY way to recover.\n"));

    // Display words in a nice format
    console.log(pc.bold('\n┌─────────────────────────────────────────────────────────────────┐'));
    console.log(pc.bold("│               YOUR 12 RECOVERY WORDS (WRITE ON PAPER!)           │"));
    console.log(pc.bold('└─────────────────────────────────────────────────────────────────┘\n'));

    for (let i = 0; i < words.length; i += 3) {
      const line = words.slice(i, i + 3);
      const formatted = line.map((w, idx) =>
        pc.green(`${String(i + idx + 1).padStart(2)}. ${w}`)
      ).join('    ');
      console.log(`  ${formatted}`);
    }

    console.log("\n" + pc.bold(pc.yellow("⚠️  NEVER share these words with anyone!")));
    console.log(pc.dim("Store in a safe place (physical safe, safe deposit box, etc.).\n"));

    const { wroteDown } = await prompts({
      type: 'confirm',
      name: 'wroteDown',
      message: pc.green("✅ I have written these 12 words on paper and stored them safely"),
      initial: false
    });

    if (!wroteDown) {
      console.log(pc.red("\n⚠️  Setup cancelled."));
      console.log(pc.yellow("\n⚠️  You must restart the setup process from the beginning."));
      console.log(pc.dim("  • Screenshot the 12 words above (temporarily only)"));
      console.log(pc.dim("  • Write on paper, then delete the screenshot"));
      console.log(pc.dim("  • Run `lembaranz setup` again\n"));
      return;
    }

    // Verify they wrote it down
    const { wantVerify } = await prompts({
      type: 'confirm',
      name: 'wantVerify',
      message: "Want to verify the first 3 words to ensure they are written correctly?",
      initial: true
    });

    if (wantVerify) {
      const { typedWords } = await prompts({
        type: 'text',
        name: 'typedWords',
        message: "Type the first 3 words (separate with spaces):"
      });

      const typed = typedWords?.trim().toLowerCase().split(/\s+/) || [];
      const expected = words.slice(0, 3);

      if (typed.join(' ') !== expected.join(' ')) {
        console.log(pc.red("\n✗ Words do not match! Check your writing again."));
        console.log(pc.yellow("\nYour 12 words:"));
        console.log(pc.cyan(mnemonic));
        console.log(pc.dim("\nRun `lembaranz setup` again after writing correctly.\n"));
        return;
      }

      console.log(pc.green("\n✅ Verification successful! You have written them correctly.\n"));
    }

    // Step 3: Create vault
    console.log(pc.cyan('\n🔐 Step 3/3: Creating Your Vault...'));

    const setupResult = await Archive.setupVault(password, mnemonic);
    if (setupResult.error) {
      console.log(pc.red(`\n✗ Failed to create vault: ${setupResult.error.message}`));
      return;
    }

    console.log(pc.green('\n✅ Vault created successfully!\n'));
    console.log(pc.bold('🎉 You\'re all set!\n'));

    // Next steps
    console.log(pc.cyan('What would you like to do next?\n'));
    const { nextAction } = await prompts({
      type: 'select',
      name: 'nextAction',
      message: 'Choose an option:',
      choices: [
        { title: '📝 Store your first credential', value: 'store' },
        { title: '📋 See all commands', value: 'commands' },
        { title: '🚪 Exit', value: 'exit' }
      ]
    });

    if (nextAction === 'store') {
      await storeFirstCredential();
    } else if (nextAction === 'commands') {
      showCommandsHelp();
    }

    console.log(pc.green('\n🎊 Welcome to Lembaranz! Your credentials are now secure.\n'));

  } catch (error) {
    console.log(pc.red('\n✗ Setup failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Helper functions

async function clearProgress() {
  try {
    const progressFile = path.join(process.cwd(), '.lembaranz', 'setup-progress.json');
    await fs.unlink(progressFile);
  } catch {
    // Ignore if file doesn't exist
  }
}

async function unlockVaultInteractive() {
  console.log(pc.cyan('\n🔓 Unlocking Vault'));

  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Enter your password:'
  });

  if (!password) {
    console.log(pc.red('\n✗ Cancelled'));
    return;
  }

  const result = await Archive.unlockVault(password);
  if (result.error) {
    console.log(pc.red(`\n✗ Failed to unlock: ${result.error.message}`));
    console.log(pc.yellow('\nForgot your password? Use your 12-word recovery phrase.'));
    const { useRecovery } = await prompts({
      type: 'confirm',
      name: 'useRecovery',
      message: 'Use recovery phrase?',
      initial: false
    });

    if (useRecovery) {
      await recoverVaultInteractive();
    }
  } else {
    console.log(pc.green('\n✅ Vault unlocked!'));
  }
}

async function recoverVaultInteractive() {
  console.log(pc.cyan('\n🆘 Recovery Mode'));
  console.log(pc.dim('Enter your 12-word recovery phrase:\n'));

  const { mnemonic } = await prompts({
    type: 'text',
    name: 'mnemonic',
    message: '12-word phrase:'
  });

  if (!mnemonic) {
    console.log(pc.red('\n✗ Cancelled'));
    return;
  }

  const result = await Archive.recoverVault(mnemonic.trim());
  if (result.error) {
    console.log(pc.red(`\n✗ Recovery failed: ${result.error.message}`));
  } else {
    console.log(pc.green('\n✅ Vault recovered!'));

    const { newPassword } = await prompts({
      type: 'password',
      name: 'newPassword',
      message: 'Set new password:'
    });

    if (newPassword) {
      await Archive.resetPassword(newPassword);
      console.log(pc.green('✓ Password updated!'));
    }
  }
}

async function storeFirstCredential() {
  console.log(pc.cyan('\n💾 Let\'s store a credential!\n'));
  const credentials = await prompts([
    {
      type: 'text',
      name: 'title',
      message: 'Credential name (e.g., "API Key - OpenAI"):'
    },
    {
      type: 'text',
      name: 'content',
      message: 'Credential value:'
    },
    {
      type: 'text',
      name: 'tags',
      message: 'Tags (comma-separated, e.g., "api,openai"):'
    }
  ]);

  if (credentials.title && credentials.content) {
    const tags = credentials.tags ? credentials.tags.split(',').map((t: string) => t.trim()) : [];
    const result = await Archive.saveNote({
      id: '',
      title: credentials.title,
      content: credentials.content,
      folderId: null,
      isPinned: false,
      isFavorite: false,
      tags: ['credential', ...tags],
      createdAt: new Date().toISOString(),
      isCredentials: true,
      credentials: JSON.stringify({
        type: 'api_key',
        provider: tags[0] || 'unknown'
      })
    });

    if (result.error) {
      console.log(pc.red(`\n✗ Failed to save: ${result.error.message}`));
    } else {
      console.log(pc.green('\n✅ Credential saved securely!\n'));
      console.log(pc.dim(`To view it: lembaranz browse ${tags[0] || 'credential'}`));
    }
  }
}

function showCommandsHelp() {
  console.log(pc.cyan('\n📋 Available Commands:\n'));
  console.log(pc.bold('  lembaranz launch'));
  console.log(pc.dim('    → Launch interactive TUI (full interface)\n'));
  console.log(pc.bold('  lembaranz config save [tag]'));
  console.log(pc.dim('    → Save .env file to vault\n'));
  console.log(pc.bold('  lembaranz config load [tag]'));
  console.log(pc.dim('    → Load credentials to current project\n'));
  console.log(pc.bold('  lembaranz config list'));
  console.log(pc.dim('    → List all stored credentials\n'));
  console.log(pc.bold('  lembaranz browse [keyword]'));
  console.log(pc.dim('    → Search credentials by tag\n'));
  console.log(pc.bold('  lembaranz export'));
  console.log(pc.dim('    → Export encrypted backup\n'));
}
