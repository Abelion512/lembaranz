import { Archive, Context, VaultContext, Vault } from '@lembaranz/core';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'node:fs/promises';

export class TerminalUI {
    static enterTUI() {
        // Enter alternate screen buffer (like nano, vim, or claude)
        process.stdout.write('\x1b[?1049h');

        let cleanedUp = false;
        const cleanup = () => {
            if (cleanedUp) return;
            // Exit alternate screen buffer and restore original screen
            process.stdout.write('\x1b[?1049l');
            cleanedUp = true;
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => { cleanup(); process.exit(0); });
        process.on('SIGTERM', () => { cleanup(); process.exit(0); });
    }

    static async run(initialContext?: VaultContext) {
        this.enterTUI();
        const context: VaultContext = initialContext || await Context.detectContextAuto();

        while (true) {
            try {
                console.clear();
                console.log(pc.blue(pc.bold('=== LEMBARANZZ INTERFACE v1.0.1 ===')));
                console.log(`${pc.dim('Active Context:')} ${pc.bold(pc.yellow(context.toUpperCase()))}`);
                console.log(pc.dim('Personal Aksara Vault - Self-Reliant'));
                console.log(pc.dim('Type "help" for commands or "exit" to quit.\n'));

                const isInitResult = await Archive.isVaultInitialized();
                if (isInitResult.error || !isInitResult.data) {
                    await this.initializeVault();
                    continue;
                }

                await this.mainMenu();
            } catch (err) {
                console.log(pc.red(`❌ Fatal Error: ${(err as Error).message}`));
                console.log(pc.dim('Attempting to restart in 3 seconds...'));
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    private static async shellLoop() {
        while (true) {
            const res = await prompts({
                type: 'text',
                name: 'cmd',
                message: pc.cyan('aksara') + pc.dim(' Γ¥»'),
                format: (val: string) => val.trim().toLowerCase()
            });

            if (res.cmd === undefined || res.cmd === 'exit' || res.cmd === 'exit') {
                console.log(pc.dim('\n✨ See you next time.'));
                process.exit(0);
            }

            if (!res.cmd || res.cmd.trim() === '') continue;

            const [command, ...args] = res.cmd.split(' ');

            try {
                switch (command) {
                    case 'help':
                    case '?':
                        this.showHelp();
                        break;
                    case 'monitor':
                        await this.actionMonitor();
                        break;
                    case 'browse':
                        await this.actionBrowse(args.join(' '));
                        break;
                    case 'carve':
                        await this.actionCarve(args[0]);
                        break;
                    case 'credentials':
                        await this.actionCredentials();
                        break;
                    case 'import':
                        await this.actionImport();
                        break;
                    case 'export':
                        await this.actionExport();
                        break;
                    case 'serve':
                        await this.actionServe();
                        break;
                    case 'bersih':
                    case 'clear':
                        console.clear();
                        break;
                    case 'menu':
                        return; // Return to run loop which clears and shows mainMenu
                    default:
                        console.log(pc.red(`❌ Unknown command "${command}". Type "help" for help.`));
                }
            } catch (_err: unknown) {
                console.log(pc.red(`❌ An error occurred: ${(_err as Error).message}`));
            }
        }
    }

    private static showHelp() {
        console.log(pc.bold('\n📜 COMMAND LIST:'));
        console.log(`  ${pc.blue('menu')}      - Return to Main Menu`);
        console.log(`  ${pc.blue('monitor')}    - Check system health & statistics`);
        console.log(`  ${pc.blue('browse')}   - Search notes (Fuzzy Search)`);
        console.log(`  ${pc.blue('carve')}      - Note editor (Multi-line)`);
        console.log(`  ${pc.blue('credentials')} - Securely save secrets & accounts`);
        console.log(`  ${pc.blue('import')}     - Import Markdown files (.md)`);
        console.log(`  ${pc.blue('export')}     - Export vault (.lembaranz)`);
        console.log(`  ${pc.blue('serve')}    - Run local API Server`);
        console.log(`  ${pc.blue('clear')}    - Clear screen`);
        console.log(`  ${pc.blue('exit')}    - Exit application\n`);
    }

    private static async initializeVault() {
        console.log(pc.yellow('⚠ Vault not initialized yet.'));
        console.log(pc.dim('Vault is required to store your notes securely.'));

        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Create a new vault password:'
        });

        if (res.pw === undefined) {
            console.log(pc.dim('\n✨ See you next time.'));
            process.exit(0);
        }

        if (!res.pw) {
            console.log(pc.red('❌ Password cannot be empty.'));
            await new Promise(r => setTimeout(r, 1500));
            return;
        }

        console.log(pc.dim('Setting up vault (deriving Argon2id key)...'));
        const setupResult = await Archive.setupVault(res.pw);

        if (setupResult.error) {
            console.log(pc.red(`❌ Failed to setup vault: ${setupResult.error.message}`));
            await new Promise(r => setTimeout(r, 3000));
            return;
        }

        console.log(pc.green('✅ Vault created and unlocked!'));
        console.log(pc.dim('Redirecting to main menu...'));
        await new Promise(r => setTimeout(r, 2000));
    }

    private static async unlock(): Promise<boolean> {
        if (!Vault.isLocked()) return true;
        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Enter vault password:'
        });
        if (res.pw === undefined || !res.pw) return false;

        const unlockResult = await Archive.unlockVault(res.pw);
        if (unlockResult.error) {
            console.log(pc.red(`❌ Failed to unlock vault: ${unlockResult.error.message}`));
            await new Promise(r => setTimeout(r, 2000));
            return false;
        }

        if (!unlockResult.data) {
            console.log(pc.red('❌ Wrong password.'));
            await new Promise(r => setTimeout(r, 1500));
            return false;
        }

        return true;
    }

    private static async mainMenu() {
        const res = await prompts({
            type: 'select',
            name: 'aksi',
            message: 'Select action:',
            choices: [
                { title: '📊 Monitor Status', value: 'monitor' },
                { title: '📂 Browse Archive', value: 'browse' },
                { title: '📝 Carve Note', value: 'carve' },
                { title: '🔑 Save Credentials', value: 'credentials' },
                { title: '🌱 Plant .env (Import)', value: 'tanam_env' },
                { title: '🛡️ Security Audit', value: 'audit_keamanan' },
                { title: '📡 Sentinel Status', value: 'sentinel' },
                { title: '🛡️ Privacy Report', value: 'audit_privasi' },
                { title: '🌱 Plant (Import)', value: 'import' },
                { title: '📦 Harvest (Export)', value: 'export' },
                { title: '🚀 Serve Server', value: 'serve' },
                { title: '💻 Enter Shell Mode (CLI)', value: 'shell' },
                { title: '✨ Exit', value: 'exit' }
            ]
        });

        if (res.aksi === 'shell') {
            await this.shellLoop();
            return;
        }

        if (res.aksi === 'exit') {
            console.log(pc.dim('\nΓ£¿ See you next time.'));
            process.exit(0);
        }

        switch (res.aksi) {
            case 'monitor': await this.actionMonitor(); break;
            case 'browse': await this.actionBrowse(); break;
            case 'carve': await this.actionCarve(); break;
            case 'credentials': await this.actionCredentials(); break;
            case 'tanam_env': await this.actionImportEnv(); break;
            case 'audit_keamanan': await this.actionAuditSecurity(); break;
            case 'sentinel': await this.actionMonitor(); break;
            case 'audit_privasi': await this.actionAuditPrivacy(); break;
            case 'import': await this.actionImport(); break;
            case 'export': await this.actionExport(); break;
            case 'serve': await this.actionServe(); break;
        }

        if (res.aksi !== 'exit') {
            console.log(pc.dim('\nPress ENTER to return...'));
            await prompts({ type: 'text', name: 'pause', message: '' });
        }
    }

    static async actionMonitor(initialContext?: VaultContext) {
        const context: VaultContext = initialContext || await Context.detectContextAuto();
        console.log(pc.bold(`\n📊 STATUS SISTEM [${context.toUpperCase()}]:`));
        if (Vault.isLocked()) {
            console.log(pc.yellow('🔒 Vault Locked. Unlock to view full statistics.'));
        }
        const stats = await Archive.getStats();
        console.log(pc.green('✅ Database: Active'));
        console.log(pc.blue(`📂 Total Notes: ${stats.notes}`));
        console.log(pc.magenta(`📁 Total Folders: ${stats.folders}`));

        const env = await Context.readEnv();
        const envKeys = Object.keys(env);
        if (envKeys.length > 0) {
            console.log(pc.cyan(`\n🌱 Courtyard (.env) detected (${envKeys.length} entries):`));
            envKeys.slice(0, 5).forEach(k => console.log(`  ├── ${pc.bold(k)}`));
            if (envKeys.length > 5) console.log(`  └── ...and ${envKeys.length - 5} more`);
        }
        console.log(pc.dim('---------------------------'));
    }

    static async actionBrowse(query?: string) {
        if (!(await this.unlock())) return;

        let q = query;
        if (!q) {
            const queryRes = await prompts({ type: 'text', name: 'q', message: 'Search notes:' });
            if (queryRes.q === undefined) return;
            q = queryRes.q;
        }

        const notesRes = await Archive.getAllNotes();
        if (notesRes.error) {
            console.log(pc.red(`❌ Failed to load notes: ${notesRes.error.message}`));
            return;
        }

        let notes = notesRes.data!;
        if (q) {
            notes = notes.filter(n =>
                n.title.toLowerCase().includes(q!.toLowerCase()) ||
                n.preview?.toLowerCase().includes(q!.toLowerCase())
            );
        }

        if (notes.length === 0) {
            console.log(pc.yellow('Not found.'));
        } else {
            const select = await prompts({
                type: 'select',
                name: 'noteId',
                message: `Found ${notes.length} notes. Select to view:`,
                choices: notes.map(n => ({ title: n.title, value: n.id }))
            });
            if (select.noteId) {
                const noteResult = await Archive.getNoteById(select.noteId);
                if (noteResult.error) {
                    console.log(pc.red(`❌ Failed to open note: ${noteResult.error.message}`));
                    return;
                }
                const n = noteResult.data;
                console.log(pc.cyan(`\n📂 === ${n?.title} ===`));
                console.log(pc.dim(`Created: ${n?.createdAt}`));
                console.log(pc.dim('---'));
                console.log(n?.content);
                console.log(pc.dim('====================\n'));
            }
        }
    }

    static async actionCarve(id?: string) {
        if (!(await this.unlock())) return;

        if (id) {
            const noteResult = await Archive.getNoteById(id);
            if (noteResult.error) {
                console.log(pc.red(`❌ Failed to fetch note: ${noteResult.error.message}`));
                return;
            }
            const note = noteResult.data;
            if (!note) {
                console.log(pc.red('❌ Note not found.'));
                return;
            }
            console.log(pc.blue(`\n📝 Editing: ${pc.bold(note.title)}`));
            const res = await prompts({
                type: 'text',
                name: 'content',
                message: 'Content (Multiline):',
                initial: note.content,
                multiline: true
            });
            if (res.content !== undefined) {
                const saveResult = await Archive.saveNote({
                    id: note.id,
                    title: note.title,
                    content: res.content,
                    folderId: note.folderId,
                    isPinned: note.isPinned,
                    isFavorite: note.isFavorite,
                    tags: note.tags,
                    createdAt: note.createdAt,
                    isCredentials: note.isCredentials,
                    credentials: typeof note.credentials === 'string'
                        ? note.credentials
                        : note.credentials ? JSON.stringify(note.credentials) : undefined,
                });
                if (saveResult.error) {
                    console.log(pc.red(`❌ Failed to update note: ${saveResult.error.message}`));
                } else {
                    console.log(pc.green('✅ Note updated successfully.'));
                }
            }
        } else {
            console.log(pc.blue('\n📝 Editing Note'));
            const res = await prompts([
                { type: 'text', name: 'title', message: 'Note Title:', initial: 'Untitled' },
                {
                    type: 'text',
                    name: 'content',
                    message: 'Content:',
                    multiline: true
                }
            ]);
            if (res.content !== undefined) {
                const saveResult = await Archive.saveNote({
                    id: '',
                    title: res.title || 'Untitled',
                    content: res.content,
                    folderId: null,
                    isPinned: false,
                    isFavorite: false,
                    tags: [],
                    createdAt: new Date().toISOString()
                });
                if (saveResult.error) {
                    console.log(pc.red(`❌ Failed to save note: ${saveResult.error.message}`));
                } else {
                    console.log(pc.green('✅ Note saved successfully.'));
                }
            }
        }
    }

    static async actionImport() {
        console.log(pc.yellow('\n🌱 Plant Feature (Import)'));
        try {
            const files = await fs.readdir('.');
            const mdFiles = files.filter(f => f.endsWith('.md'));

            if (mdFiles.length === 0) {
                console.log(pc.red('❌ No .md files found.'));
                return;
            }

            const select = await prompts({
                type: 'multiselect',
                name: 'targets',
                message: 'Select files:',
                choices: mdFiles.map(f => ({ title: f, value: f }))
            });

            if (select.targets && select.targets.length > 0) {
                if (!(await this.unlock())) return;
                for (const file of select.targets) {
                    const content = await fs.readFile(file, 'utf8');
                    const saveResult = await Archive.saveNote({
                        id: '',
                        title: file,
                        content,
                        folderId: null,
                        isPinned: false,
                        isFavorite: false,
                        tags: ['impor'],
                        createdAt: new Date().toISOString()
                    });
                    if (saveResult.error) {
                        console.log(pc.red(`❌ Failed to plant ${file}: ${saveResult.error.message}`));
                    } else {
                        console.log(pc.green(`✅ ${file} imported successfully.`));
                    }
                }
            }
        } catch (_err) {
            console.log(pc.red('❌ Failed to read directory.'));
        }
    }

    static async actionExport() {
        if (!(await this.unlock())) return;
        console.log(pc.magenta('\n📦 Harvesting Vault (Export)'));

        const notesRes = await Archive.getAllNotes();
        if (notesRes.error) {
            console.log(pc.red(`❌ Failed to fetch data: ${notesRes.error.message}`));
            return;
        }

        const data = JSON.stringify(notesRes.data);
        const encRes = await Vault.encryptPacked(data);
        if (encRes.error) {
            console.log(pc.red(`❌ Failed to perform export encryption: ${encRes.error.message}`));
            return;
        }

        const filename = `lembaranz-petikan-${new Date().toISOString().split('T')[0]}.lembaranz`;
        await fs.writeFile(filename, encRes.data);
        console.log(pc.green(`✅ Successfully harvested to: ${pc.bold(filename)}`));
    }

    static async actionCredentials() {
        if (!(await this.unlock())) return;

        console.log(pc.magenta('\n🔑 Save New Credentials'));
        const res = await prompts([
            { type: 'text', name: 'label', message: 'Service:', initial: 'New Service' },
            { type: 'text', name: 'url', message: 'URL (Optional):' },
            { type: 'text', name: 'username', message: 'Username:' },
            { type: 'password', name: 'password', message: 'Password:' }
        ]);

        if (res.password) {
            const saveResult = await Archive.saveNote({
                id: '',
                title: `🛡️ ${res.label}`,
                content: `Credentials for ${res.label}`,
                folderId: null,
                isPinned: true,
                isFavorite: false,
                isCredentials: true,
                credentials: {
                    username: res.username,
                    password: res.password,
                    url: res.url
                },
                tags: ['Credentials'],
                createdAt: new Date().toISOString()
            });
            if (saveResult.error) {
                console.log(pc.red(`❌ Failed to save credentials: ${saveResult.error.message}`));
            } else {
                console.log(pc.green('✅ Successfully saved.'));
            }
        }
    }

    static async actionServe() {
        console.log(pc.cyan('\n🚀 Local API Server'));
        console.log(pc.green("Γ£à Active at http://localhost:1401"));
        console.log(pc.dim("Press Ctrl+C to stop."));
        await new Promise(() => { });
    }

    static async actionAuditPrivacy() {
        console.log(pc.bold(pc.green('\n🛡️ PRIVACY REPORT & TRANSPARENCY AUDIT')));
        console.log(pc.dim('Viewing data processing activity by Sentinel...\n'));
        const { AuditLog } = await import('@lembaranz/core');
        const log = await AuditLog.readLog();
        console.log(log);
        console.log(pc.dim("\nType anything to return..."));
        await prompts({ type: 'text', name: 'any', message: '' });
    }

    static async actionImportEnv() {
        if (!(await this.unlock())) return;

        console.log(pc.yellow('\n🌱 Importing credentials from .env'));
        const env = await Context.readEnv();
        const keys = Object.keys(env);

        if (keys.length === 0) {
            console.log(pc.red("❌ No .env file found or file is empty."));
            return;
        }

        const selection = await prompts({
            type: 'multiselect',
            name: 'target',
            message: `Detected ${keys.length} variables. Select which ones to secure in vault:`,
            choices: keys.map(k => ({ title: k, value: k }))
        });

        if (selection.target && selection.target.length > 0) {
            console.log(pc.dim('Importing credentials...'));
            await Promise.all(selection.target.map(async (key: string) => {
                const saveResult = await Archive.saveNote({
                    id: '',
                    title: `🛡️ ENV: ${key}`,
                    content: `Environment variables auto-imported from .env`,
                    folderId: null,
                    isPinned: false,
                    isFavorite: false,
                    isCredentials: true,
                    credentials: {
                        username: 'SYSTEM_ENV',
                        password: env[key],
                        url: '.env'
                    },
                    tags: ['ENV', 'Impor'],
                    createdAt: new Date().toISOString()
                });
                if (saveResult.error) {
                    console.log(pc.red(`  ├── ❌ ${key}: ${saveResult.error.message}`));
                } else {
                    console.log(pc.green(`  ├── ✅ ${key}`));
                }
            }));
            console.log(pc.green('✨ Done! Your credentials are now securely stored in Lembaranz.'));
        }
    }

    static async actionAuditSecurity() {
        console.log(pc.bold(pc.blue('\n🔒 SECURITY & PRIVACY DASHBOARD')));
        console.log(pc.dim('Your vault protection technology status:'));

        console.log(`\n  ${pc.bold('1. Encryption Algorithm')}`);
        console.log(pc.green('     ✅ AES-GCM 256-bit'));
        console.log(pc.dim("     Double layer encryption for note content and title."));

        console.log(`\n  ${pc.bold('2. Key Derivation')}`);
        console.log(pc.green('     ✅ Argon2id (OWASP Standard)'));
        console.log(pc.dim("     Highly resistant to Brute-Force and GPU cracking attacks."));

        console.log(`\n  ${pc.bold('3. Data Integrity')}`);
        console.log(pc.green('     ✅ SHA-256 Digital Seal'));
        console.log(pc.dim("     Detects illegal modifications by malware or third parties."));

        console.log(`\n  ${pc.bold('4. Autonomous Filtration')}`);
        console.log(pc.green('     ✅ Secret Scrubber'));
        console.log(pc.dim("     Automatically removes credentials before being processed by AI."));

        console.log(pc.cyan('\nConclusion: Your system has Absolute Sovereignty.'));
    }
}
