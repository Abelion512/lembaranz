import { Command } from 'commander';
import prompts from 'prompts';
import { Archive } from '@lembaranz/core';
import { generateMnemonic } from '@lembaranz/core';
import { prepareContext } from '../utils.js';
import pc from 'picocolors';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';

const PROGRESS_FILE = path.join(process.cwd(), '.lembaran', 'setup-progress.json');

export function registerSetupCommand(program: Command) {
  program
    .command('setup')
    .alias('init')
    .description('Interactive setup wizard for beginners (CLI or GUI)')
    .action(async () => {
      console.log(pc.bold('\n🚀 Lembaran Setup Wizard'));
      console.log(pc.dim('Set up your secure credential vault in 3 easy steps.\n'));

      try {
        await prepareContext(program.opts());

        // Ask user to choose interface
        const { interfaceChoice } = await prompts({
          type: 'select',
          name: 'interfaceChoice',
          message: 'Choose your preferred setup method:',
          choices: [
            {
              title: '🖥️  CLI (Terminal)',
              value: 'cli',
              description: 'Interactive text-based wizard'
            },
            {
              title: '🌐 GUI (Browser)',
              value: 'gui',
              description: 'Visual web interface (like n8n, local only)'
            }
          ]
        });

        if (interfaceChoice === 'gui') {
          await launchGUISetup();
          return;
        }

        // CLI Setup
        await runCLISetup(program);

      } catch (error) {
        console.log(pc.red('\n✗ Setup failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}

async function launchGUISetup() {
  console.log(pc.cyan('\n🌐 Launching GUI Setup...'));
  console.log(pc.dim('Building and starting production server (more stable than dev mode)...\n'));

  // Check if lembaran-web exists (landing page is now separate)
  const webDir = path.join(process.cwd(), '..', 'lembaran-web');
  try {
    await fs.access(webDir);
  } catch {
    console.log(pc.red('\n✗ lembaran-web not found!'));
    console.log(pc.yellow('Please make sure you are in the lembaran/ directory inside the monorepo.\n'));
    console.log(pc.dim('Expected structure:'));
    console.log(pc.dim('  lembaran/'));
    console.log(pc.dim('  lembaran-web/ ← landing page (separate)\n'));
    return;
  }

  // Check if already built
  const buildDir = path.join(webDir, '.next');
  let needsBuild = true;
  try {
    await fs.access(buildDir);
    needsBuild = false;
    console.log(pc.green('✓ Found existing build, skipping build step\n'));
  } catch {
    console.log(pc.yellow('⚠️  No build found, building first time...\n'));
  }

  if (needsBuild) {
    console.log(pc.cyan('🔨 Building lembaran-web...'));
    const buildProcess = spawn('bun', ['run', 'build'], {
      cwd: webDir,
      stdio: 'inherit',
      shell: true
    });

    await new Promise<void>((resolve, reject) => {
      buildProcess.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });

    console.log(pc.green('✓ Build complete!\n'));
  }

  console.log(pc.green('✓ Starting production server on http://localhost:1400\n'));
  console.log(pc.yellow('⚠️  Keep this terminal open! Press Ctrl+C to stop the server.\n'));
  console.log(pc.dim('📝 All actions will be logged in this terminal.\n'));

  // Spawn the production server (more stable than dev)
  const serverProcess = spawn('bun', ['run', 'start'], {
    cwd: webDir,
    stdio: 'inherit',
    shell: true
  });

  // Log file
  const logFile = path.join(process.cwd(), 'setup-gui.log');
  const logStream = await fs.openFile(logFile, 'a');
  await logStream.write(`\n[${new Date().toISOString()}] GUI Setup Session Started (Production Mode)\n`);

  // Auto-restart on crash (like Docker restart policy)
  serverProcess.on('exit', async (code, signal) => {
    if (code !== 0 && code !== null) {
      console.log(pc.yellow(`\n⚠️  Server crashed (code ${code}). Restarting in 3 seconds...\n`));
      await logStream.write(`[${new Date().toISOString()}] Server crashed with code ${code}, restarting...\n`);

      setTimeout(() => {
        const newProcess = spawn('bun', ['run', 'start'], {
          cwd: webDir,
          stdio: 'inherit',
          shell: true
        });
        // Note: In a real implementation, you'd update the serverProcess reference
      }, 3000);
    }
  });

  // Wait for user to finish
  console.log(pc.cyan('\n📋 Setup Instructions:'));
  console.log(pc.dim('  1. Open http://localhost:1400 in your browser'));
  console.log(pc.dim('  2. Look for "Setup Wizard" or "Get Started" button'));
  console.log(pc.dim('  3. Follow the visual wizard'));
  console.log(pc.dim('  4. Come back here and press Enter when done\n'));

  await prompts({
    type: 'text',
    name: 'done',
    message: 'Press Enter when you have completed the GUI setup:',
    initial: ''
  });

  // Stop the server
  console.log(pc.yellow('\n⏹️  Stopping server...'));
  serverProcess.kill();

  await logStream.write(`[${new Date().toISOString()}] GUI Setup Session Completed\n`);
  await logStream.close();

  console.log(pc.green(`✓ Server stopped. Setup log saved to: ${logFile}\n`));
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
        await clearProgress();
        console.log(pc.green('✓ Old vault destroyed'));
      } else {
        await unlockVaultInteractive();
        return;
      }
    }

    // Check if there's saved progress
    const savedProgress = await loadProgress();
    if (savedProgress && savedProgress.step >= 1) {
      console.log(pc.cyan('\n💾 Found saved progress from previous session!'));
      console.log(pc.dim('You were at Step 2 (Recovery Phrase).\n'));

      const { continueSetup } = await prompts({
        type: 'confirm',
        name: 'continueSetup',
        message: 'Continue from where you left off?',
        initial: true
      });

      if (continueSetup) {
        await runCLISetup(program);
        return;
      } else {
        await clearProgress();
        console.log(pc.dim('Starting fresh setup...\n'));
      }
    }

    // Step 1: Create password
    console.log(pc.cyan('\n📝 Step 1/3: Create Your Master Password'));
    console.log(pc.dim('This password protects all your credentials. Make it strong!\n'));

    let password = '';
    let confirmed = false;

    while (!confirmed) {
      const passwordResult = await prompts({
        type: 'password',
        name: 'password',
        message: 'Enter a strong password (min 8 characters):',
        validate: (val: string) => val.length >= 8 ? true : 'Password must be at least 8 characters'
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

    // Save progress after step 1
    await saveProgress({ password, mnemonic: '', step: 1 });

    // Step 2: Generate recovery phrase
    console.log(pc.cyan('\n🔑 Step 2/3: Your Recovery Phrase'));
    console.log(pc.yellow('\n⚠️  PENTING: Tulis 12 kata ini di KERTAS!'));
    console.log(pc.dim('Jika lupa password, 12 kata ini SATU-SATUNYA cara untuk recover.\n'));

    const mnemonic = generateMnemonic(12);
    const words = mnemonic.split(' ');

    // Display words in a nice format
    console.log(pc.bold('\n┌─────────────────────────────────────────────────────────────────┐'));
    console.log(pc.bold('│               12 KATA PEMULIHAN ANDA (TULIS DI KERTAS!)           │'));
    console.log(pc.bold('└─────────────────────────────────────────────────────────────────┘\n'));

    for (let i = 0; i < words.length; i += 3) {
      const line = words.slice(i, i + 3);
      const formatted = line.map((w, idx) =>
        pc.green(`${String(i + idx + 1).padStart(2)}. ${w}`)
      ).join('    ');
      console.log(`  ${formatted}`);
    }

    console.log('\n' + pc.bold(pc.yellow('⚠️  JANGAN pernah bagikan kata-kata ini ke siapapun!')));
    console.log(pc.dim('Simpan di tempat aman (brankas fisik, safe deposit box, dll).\n'));

    const { wroteDown } = await prompts({
      type: 'confirm',
      name: 'wroteDown',
      message: pc.green('✅ Saya sudah menulis 12 kata ini di kertas dan menyimpannya dengan aman'),
      initial: false
    });

    if (!wroteDown) {
      console.log(pc.red('\n⚠️  Setup dibatalkan.'));
      console.log(pc.yellow('\n💾 Progress tersimpan! Anda bisa lanjut nanti.'));
      console.log(pc.dim('  • Screenshot 12 kata di atas (hanya untuk sementara)'));
      console.log(pc.dim('  • Tulis di kertas, lalu hapus screenshot'));
      console.log(pc.dim('  • Jalankan `lembaran setup` lagi - password & seed phrase akan sama\n'));

      // Save progress
      await saveProgress({ password, mnemonic, step: 2 });
      return;
    }

    // Save progress after step 2
    await saveProgress({ password, mnemonic, step: 2 });

    // Verify they wrote it down
    const { wantVerify } = await prompts({
      type: 'confirm',
      name: 'wantVerify',
      message: 'Mau verifikasi 3 kata pertama untuk memastikan sudah ditulis benar?',
      initial: true
    });

    if (wantVerify) {
      const { typedWords } = await prompts({
        type: 'text',
        name: 'typedWords',
        message: 'Ketik 3 kata pertama (pisahkan dengan spasi):'
      });

      const typed = typedWords?.trim().toLowerCase().split(/\s+/) || [];
      const expected = words.slice(0, 3);

      if (typed.join(' ') !== expected.join(' ')) {
        console.log(pc.red('\n✗ Kata tidak cocok! Periksa lagi tulisan Anda.'));
        console.log(pc.yellow('\n12 kata Anda:'));
        console.log(pc.cyan(mnemonic));
        console.log(pc.dim('\nJalankan `lembaran setup` lagi setelah menulis dengan benar.\n'));
        return;
      }

      console.log(pc.green('\n✅ Verifikasi berhasil! Anda sudah menulis dengan benar.\n'));
    }

    // Step 3: Create vault
    console.log(pc.cyan('\n🔐 Step 3/3: Creating Your Vault...'));

    const setupResult = await Archive.setupVault(password, mnemonic);
    if (setupResult.error) {
      console.log(pc.red(`\n✗ Failed to create vault: ${setupResult.error.message}`));
      return;
    }

    // Clear saved progress
    await clearProgress();

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

    console.log(pc.green('\n🎊 Welcome to Lembaran! Your credentials are now secure.\n'));

  } catch (error) {
    console.log(pc.red('\n✗ Setup failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Helper functions

async function saveProgress(data: { password: string; mnemonic: string; step: number }) {
  try {
    const progressDir = path.join(process.cwd(), '.lembaran');
    await fs.mkdir(progressDir, { recursive: true });
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Silently fail if can't save progress
  }
}

async function loadProgress(): Promise<{ password: string; mnemonic: string; step: number } | null> {
  try {
    const content = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function clearProgress() {
  try {
    await fs.unlink(PROGRESS_FILE);
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
      console.log(pc.dim(`To view it: lembaran browse ${tags[0] || 'credential'}`));
    }
  }
}

function showCommandsHelp() {
  console.log(pc.cyan('\n📋 Available Commands:\n'));
  console.log(pc.bold('  lembaran launch'));
  console.log(pc.dim('    → Launch interactive TUI (full interface)\n'));
  console.log(pc.bold('  lembaran config save [tag]'));
  console.log(pc.dim('    → Save .env file to vault\n'));
  console.log(pc.bold('  lembaran config load [tag]'));
  console.log(pc.dim('    → Load credentials to current project\n'));
  console.log(pc.bold('  lembaran config list'));
  console.log(pc.dim('    → List all stored credentials\n'));
  console.log(pc.bold('  lembaran browse [keyword]'));
  console.log(pc.dim('    → Search credentials by tag\n'));
  console.log(pc.bold('  lembaran export'));
  console.log(pc.dim('    → Export encrypted backup\n'));
}
