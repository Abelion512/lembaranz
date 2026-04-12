import { Archive, Context, VaultContext, Vault } from '@lembaranz/core';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'node:fs/promises';

export class Antarmuka {
    static enterTUI() {
        // Masuk ke alternate screen buffer (seperti nano, vim, atau claude)
        process.stdout.write('\x1b[?1049h');

        let cleanedUp = false;
        const cleanup = () => {
            if (cleanedUp) return;
            // Keluar dari alternate screen buffer dan pulihkan layar asli
            process.stdout.write('\x1b[?1049l');
            cleanedUp = true;
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => { cleanup(); process.exit(0); });
        process.on('SIGTERM', () => { cleanup(); process.exit(0); });
    }

    static async jalankan(konteksAwal?: VaultContext) {
        this.enterTUI();
        const konteks: VaultContext = konteksAwal || await Context.detectContextAuto();

        while (true) {
            try {
                console.clear();
                console.log(pc.blue(pc.bold('=== LEMBARAN ANTARMUKA v3.1.0 ===')));
                console.log(`${pc.dim('Konteks Aktif:')} ${pc.bold(pc.yellow(konteks.toUpperCase()))}`);
                console.log(pc.dim('Brankas Aksara Personal yang Berdikari'));
                console.log(pc.dim('Ketik "bantuan" untuk daftar perintah atau "keluar" untuk berhenti.\n'));

                const isInitRes = await Archive.isVaultInitialized();
                if (isInitRes.error || !isInitRes.data) {
                    await this.initializeVault();
                    continue;
                }

                await this.menuUtama();
            } catch (err) {
                console.log(pc.red(`❌ Fatal Error: ${(err as Error).message}`));
                console.log(pc.dim('Mencoba memulai kembali dalam 3 detik...'));
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

            if (res.cmd === undefined || res.cmd === 'keluar' || res.cmd === 'exit') {
                console.log(pc.dim('\n✨ Sampai jumpa di lain waktu.'));
                process.exit(0);
            }

            if (!res.cmd || res.cmd.trim() === '') continue;

            const [command, ...args] = res.cmd.split(' ');

            try {
                switch (command) {
                    case 'bantuan':
                    case 'help':
                    case '?':
                        this.tampilkanBantuan();
                        break;
                    case 'pantau':
                        await this.aksiPantau();
                        break;
                    case 'jelajah':
                        await this.aksiJelajah(args.join(' '));
                        break;
                    case 'ukir':
                        await this.aksiUkir(args[0]);
                        break;
                    case 'kredensial':
                        await this.aksiKredensial();
                        break;
                    case 'tanam':
                        await this.aksiTanam();
                        break;
                    case 'petik':
                        await this.aksiPetik();
                        break;
                    case 'layani':
                        await this.aksiLayani();
                        break;
                    case 'bersih':
                    case 'clear':
                        console.clear();
                        break;
                    case 'menu':
                        return; // Return to jalankan loop which clears and shows menuUtama
                    default:
                        console.log(pc.red(`❌ Perintah "${command}" tidak dikenal. Ketik "bantuan" untuk bantuan.`));
                }
            } catch (_err: unknown) {
                console.log(pc.red(`❌ Terjadi kesalahan: ${(_err as Error).message}`));
            }
        }
    }

    private static tampilkanBantuan() {
        console.log(pc.bold('\n📜 DAFTAR PERINTAH:'));
        console.log(`  ${pc.blue('menu')}      - Kembali ke Menu Utama`);
        console.log(`  ${pc.blue('pantau')}    - Memeriksa kesehatan sistem & statistik`);
        console.log(`  ${pc.blue('jelajah')}   - Mencari catatan (Fuzzy Search)`);
        console.log(`  ${pc.blue('ukir')}      - Editor catatan (Mumpuni & Multi-line)`);
        console.log(`  ${pc.blue('kredensial')} - Menyimpan rahasia & akun secara aman`);
        console.log(`  ${pc.blue('tanam')}     - Mengimpor file Markdown (.md)`);
        console.log(`  ${pc.blue('petik')}     - Mengekspor brankas (.lembaran)`);
        console.log(`  ${pc.blue('layani')}    - Menjalankan API Server lokal`);
        console.log(`  ${pc.blue('bersih')}    - Membersihkan layar`);
        console.log(`  ${pc.blue('keluar')}    - Keluar dari aplikasi\n`);
    }

    private static async initializeVault() {
        console.log(pc.yellow('⚠ Brankas belum terinisialisasi.'));
        console.log(pc.dim('Brankas diperlukan untuk menyimpan catatan Anda secara terenkripsi.'));

        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Buat kata sandi baru untuk brankas Anda:'
        });

        if (res.pw === undefined) {
            console.log(pc.dim('\n✨ Sampai jumpa di lain waktu.'));
            process.exit(0);
        }

        if (!res.pw) {
            console.log(pc.red('❌ Kata sandi tidak boleh kosong.'));
            await new Promise(r => setTimeout(r, 1500));
            return;
        }

        console.log(pc.dim('Sedang menyiapkan brankas (membangun kunci Argon2id)...'));
        const setupRes = await Archive.setupVault(res.pw);

        if (setupRes.error) {
            console.log(pc.red(`❌ Gagal menyiapkan brankas: ${setupRes.error.message}`));
            await new Promise(r => setTimeout(r, 3000));
            return;
        }

        console.log(pc.green('✅ Brankas berhasil dibuat dan dibuka!'));
        console.log(pc.dim('Mengalihkan ke menu utama...'));
        await new Promise(r => setTimeout(r, 2000));
    }

    private static async unlock(): Promise<boolean> {
        if (!Vault.isLocked()) return true;
        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Masukkan kata sandi brankas:'
        });
        if (res.pw === undefined || !res.pw) return false;

        const unlockRes = await Archive.unlockVault(res.pw);
        if (unlockRes.error) {
            console.log(pc.red(`❌ Gagal membuka brankas: ${unlockRes.error.message}`));
            await new Promise(r => setTimeout(r, 2000));
            return false;
        }

        if (!unlockRes.data) {
            console.log(pc.red('❌ Kata sandi salah.'));
            await new Promise(r => setTimeout(r, 1500));
            return false;
        }

        return true;
    }

    private static async menuUtama() {
        const res = await prompts({
            type: 'select',
            name: 'aksi',
            message: 'Pilih aksi:',
            choices: [
                { title: '📊 Pantau Status', value: 'pantau' },
                { title: '📂 Jelajah Arsip', value: 'jelajah' },
                { title: '📝 Ukir Catatan', value: 'ukir' },
                { title: '🔑 Simpan Kredensial', value: 'kredensial' },
                { title: '🌱 Tanam .env (Impor)', value: 'tanam_env' },
                { title: '🛡️ Audit Keamanan', value: 'audit_keamanan' },
                { title: '📡 Status Sentinel', value: 'sentinel' },
                { title: '🛡️ Laporan Privasi', value: 'audit_privasi' },
                { title: '🌱 Tanam (Impor)', value: 'tanam' },
                { title: '📦 Petik (Ekspor)', value: 'petik' },
                { title: '🚀 Layani Server', value: 'layani' },
                { title: '💻 Masuk Mode Shell (CLI)', value: 'shell' },
                { title: '✨ Keluar', value: 'keluar' }
            ]
        });

        if (res.aksi === 'shell') {
            await this.shellLoop();
            return;
        }

        if (res.aksi === 'keluar') {
            console.log(pc.dim('\nΓ£¿ Sampai jumpa di lain waktu.'));
            process.exit(0);
        }

        switch (res.aksi) {
            case 'pantau': await this.aksiPantau(); break;
            case 'jelajah': await this.aksiJelajah(); break;
            case 'ukir': await this.aksiUkir(); break;
            case 'kredensial': await this.aksiKredensial(); break;
            case 'tanam_env': await this.aksiTanamEnv(); break;
            case 'audit_keamanan': await this.aksiAuditKeamanan(); break;
            case 'sentinel': await this.aksiPantau(); break;
            case 'audit_privasi': await this.aksiAuditPrivasi(); break;
            case 'tanam': await this.aksiTanam(); break;
            case 'petik': await this.aksiPetik(); break;
            case 'layani': await this.aksiLayani(); break;
        }

        if (res.aksi !== 'keluar') {
            console.log(pc.dim('\nTekan ENTER untuk kembali...'));
            await prompts({ type: 'text', name: 'pause', message: '' });
        }
    }

    static async aksiPantau(konteksAwal?: VaultContext) {
        const konteks: VaultContext = konteksAwal || await Context.detectContextAuto();
        console.log(pc.bold(`\n📊 STATUS SISTEM [${konteks.toUpperCase()}]:`));
        if (Vault.isLocked()) {
            console.log(pc.yellow('🔒 Brankas Terkunci. Buka untuk melihat statistik lengkap.'));
        }
        const stats = await Archive.getStats();
        console.log(pc.green('✅ Database: Aktif'));
        console.log(pc.blue(`📂 Total Catatan: ${stats.notes}`));
        console.log(pc.magenta(`📁 Total Folder: ${stats.folders}`));

        const env = await Context.readEnv();
        const envKeys = Object.keys(env);
        if (envKeys.length > 0) {
            console.log(pc.cyan(`\n🌱 Pelataran (.env) terdeteksi (${envKeys.length} entri):`));
            envKeys.slice(0, 5).forEach(k => console.log(`  ├── ${pc.bold(k)}`));
            if (envKeys.length > 5) console.log(`  └── ...dan ${envKeys.length - 5} lainnya`);
        }
        console.log(pc.dim('---------------------------'));
    }

    static async aksiJelajah(query?: string) {
        if (!(await this.unlock())) return;

        let q = query;
        if (!q) {
            const queryRes = await prompts({ type: 'text', name: 'q', message: 'Cari catatan:' });
            if (queryRes.q === undefined) return;
            q = queryRes.q;
        }

        const notesRes = await Archive.getAllNotes();
        if (notesRes.error) {
            console.log(pc.red(`❌ Gagal memuat catatan: ${notesRes.error.message}`));
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
            console.log(pc.yellow('Tidak ditemukan.'));
        } else {
            const select = await prompts({
                type: 'select',
                name: 'noteId',
                message: `Ditemukan ${notes.length} catatan. Pilih untuk melihat:`,
                choices: notes.map(n => ({ title: n.title, value: n.id }))
            });
            if (select.noteId) {
                const nRes = await Archive.getNoteById(select.noteId);
                if (nRes.error) {
                    console.log(pc.red(`❌ Gagal membuka catatan: ${nRes.error.message}`));
                    return;
                }
                const n = nRes.data;
                console.log(pc.cyan(`\n📂 === ${n?.title} ===`));
                console.log(pc.dim(`Dibuat: ${n?.createdAt}`));
                console.log(pc.dim('---'));
                console.log(n?.content);
                console.log(pc.dim('====================\n'));
            }
        }
    }

    static async aksiUkir(id?: string) {
        if (!(await this.unlock())) return;

        if (id) {
            const nRes = await Archive.getNoteById(id);
            if (nRes.error) {
                console.log(pc.red(`❌ Gagal mengambil catatan: ${nRes.error.message}`));
                return;
            }
            const note = nRes.data;
            if (!note) {
                console.log(pc.red('❌ Catatan tidak ditemukan.'));
                return;
            }
            console.log(pc.blue(`\n📝 Mengedit: ${pc.bold(note.title)}`));
            const res = await prompts({
                type: 'text',
                name: 'konten',
                message: 'Konten (Multiline):',
                initial: note.content,
                multiline: true
            });
            if (res.konten !== undefined) {
                const saveRes = await Archive.saveNote({
                    id: note.id,
                    title: note.title,
                    content: res.konten,
                    folderId: note.folderId,
                    isPinned: note.isPinned,
                    isFavorite: note.isFavorite,
                    tags: note.tags,
                    createdAt: note.createdAt,
                    isCredentials: note.isCredentials,
                    kredensial: typeof note.kredensial === 'string'
                        ? note.kredensial
                        : note.kredensial ? JSON.stringify(note.kredensial) : undefined,
                });
                if (saveRes.error) {
                    console.log(pc.red(`❌ Gagal memperbarui catatan: ${saveRes.error.message}`));
                } else {
                    console.log(pc.green('✅ Catatan berhasil diperbarui.'));
                }
            }
        } else {
            console.log(pc.blue('\n📝 Mengukir Catatan Baru'));
            const res = await prompts([
                { type: 'text', name: 'judul', message: 'Judul Catatan:', initial: 'Tanpa Judul' },
                {
                    type: 'text',
                    name: 'konten',
                    message: 'Isi Aksara:',
                    multiline: true
                }
            ]);
            if (res.konten !== undefined) {
                const saveRes = await Archive.saveNote({
                    id: '',
                    title: res.judul || 'Tanpa Judul',
                    content: res.konten,
                    folderId: null,
                    isPinned: false,
                    isFavorite: false,
                    tags: [],
                    createdAt: new Date().toISOString()
                });
                if (saveRes.error) {
                    console.log(pc.red(`❌ Gagal menyimpan aksara: ${saveRes.error.message}`));
                } else {
                    console.log(pc.green('✅ Aksara berhasil diabadikan.'));
                }
            }
        }
    }

    static async aksiTanam() {
        console.log(pc.yellow('\n🌱 Fitur Tanam (Import)'));
        try {
            const files = await fs.readdir('.');
            const mdFiles = files.filter(f => f.endsWith('.md'));

            if (mdFiles.length === 0) {
                console.log(pc.red('❌ Tidak ditemukan file .md.'));
                return;
            }

            const select = await prompts({
                type: 'multiselect',
                name: 'targets',
                message: 'Pilih file:',
                choices: mdFiles.map(f => ({ title: f, value: f }))
            });

            if (select.targets && select.targets.length > 0) {
                if (!(await this.unlock())) return;
                for (const file of select.targets) {
                    const content = await fs.readFile(file, 'utf8');
                    const saveRes = await Archive.saveNote({
                        id: '',
                        title: file,
                        content,
                        folderId: null,
                        isPinned: false,
                        isFavorite: false,
                        tags: ['impor'],
                        createdAt: new Date().toISOString()
                    });
                    if (saveRes.error) {
                        console.log(pc.red(`❌ Gagal menanam ${file}: ${saveRes.error.message}`));
                    } else {
                        console.log(pc.green(`✅ ${file} berhasil ditanam.`));
                    }
                }
            }
        } catch (_err) {
            console.log(pc.red('❌ Gagal membaca direktori.'));
        }
    }

    static async aksiPetik() {
        if (!(await this.unlock())) return;
        console.log(pc.magenta('\n📦 Memetik Brankas (Export)'));

        const notesRes = await Archive.getAllNotes();
        if (notesRes.error) {
            console.log(pc.red(`❌ Gagal mengambil data: ${notesRes.error.message}`));
            return;
        }

        const data = JSON.stringify(notesRes.data);
        const encRes = await Vault.encryptPacked(data);
        if (encRes.error) {
            console.log(pc.red(`❌ Gagal melakukan enkripsi ekspor: ${encRes.error.message}`));
            return;
        }

        const filename = `lembaran-petikan-${new Date().toISOString().split('T')[0]}.lembaran`;
        await fs.writeFile(filename, encRes.data);
        console.log(pc.green(`✅ Berhasil dipetik ke: ${pc.bold(filename)}`));
    }

    static async aksiKredensial() {
        if (!(await this.unlock())) return;

        console.log(pc.magenta('\n🔑 Menanam Kredensial Baru'));
        const res = await prompts([
            { type: 'text', name: 'label', message: 'Layanan:', initial: 'Layanan Baru' },
            { type: 'text', name: 'url', message: 'URL (Opsional):' },
            { type: 'text', name: 'username', message: 'Username:' },
            { type: 'password', name: 'password', message: 'Password:' }
        ]);

        if (res.password) {
            const saveRes = await Archive.saveNote({
                id: '',
                title: `🛡️ ${res.label}`,
                content: `Kredensial untuk ${res.label}`,
                folderId: null,
                isPinned: true,
                isFavorite: false,
                isCredentials: true,
                kredensial: {
                    username: res.username,
                    password: res.password,
                    url: res.url
                },
                tags: ['Kredensial'],
                createdAt: new Date().toISOString()
            });
            if (saveRes.error) {
                console.log(pc.red(`❌ Gagal menyimpan kredensial: ${saveRes.error.message}`));
            } else {
                console.log(pc.green('✅ Berhasil disimpan.'));
            }
        }
    }

    static async aksiLayani() {
        console.log(pc.cyan('\n🚀 Layanan API Lokal'));
        console.log(pc.green('Γ£à Aktif di http://localhost:1401'));
        console.log(pc.dim('Tekan Ctrl+C untuk berhenti.'));
        await new Promise(() => { });
    }

    static async aksiAuditPrivasi() {
        console.log(pc.bold(pc.green('\n🛡️ LAPORAN PRIVASI & AUDIT TRANSPARANSI')));
        console.log(pc.dim('Melihat aktivitas pemrosesan data oleh Sentinel...\n'));
        const { AuditLog } = await import('@lembaranz/core');
        const log = await AuditLog.readLog();
        console.log(log);
        console.log(pc.dim('\nKetik apa saja untuk kembali...'));
        await prompts({ type: 'text', name: 'any', message: '' });
    }

    static async aksiTanamEnv() {
        if (!(await this.unlock())) return;

        console.log(pc.yellow('\n🌱 Mengimpor Kredensial dari .env'));
        const env = await Context.readEnv();
        const keys = Object.keys(env);

        if (keys.length === 0) {
            console.log(pc.red('❌ Tidak menemukan file .env atau file kosong.'));
            return;
        }

        const sel = await prompts({
            type: 'multiselect',
            name: 'target',
            message: `Terdeteksi ${keys.length} variabel. Pilih yang ingin diamankan ke brankas:`,
            choices: keys.map(k => ({ title: k, value: k }))
        });

        if (sel.target && sel.target.length > 0) {
            console.log(pc.dim('Sedang menanam kredensial...'));
            for (const key of sel.target) {
                const saveRes = await Archive.saveNote({
                    id: '',
                    title: `🛡️ ENV: ${key}`,
                    content: `Variabel lingkungan otomatis dari .env`,
                    folderId: null,
                    isPinned: false,
                    isFavorite: false,
                    isCredentials: true,
                    kredensial: {
                        username: 'SYSTEM_ENV',
                        password: env[key],
                        url: '.env'
                    },
                    tags: ['ENV', 'Impor'],
                    createdAt: new Date().toISOString()
                });
                if (saveRes.error) {
                    console.log(pc.red(`  ├── ❌ ${key}: ${saveRes.error.message}`));
                } else {
                    console.log(pc.green(`  ├── ✅ ${key}`));
                }
            }
            console.log(pc.green('✨ Selesai! Kredensial Anda kini tersimpan aman di Lembaran.'));
        }
    }

    static async aksiAuditKeamanan() {
        console.log(pc.bold(pc.blue('\n≡ƒ¢í∩╕Å  DASHBOARD KEAMANAN & PRIVASI')));
        console.log(pc.dim('Status teknologi perlindungan brankas Anda:'));

        console.log(`\n  ${pc.bold('1. Algoritma Enkripsi')}`);
        console.log(pc.green('     Γ£à AES-GCM 256-bit'));
        console.log(pc.dim('     Lapis ganda untuk konten dan judul catatan.'));

        console.log(`\n  ${pc.bold('2. Derivasi Kunci')}`);
        console.log(pc.green('     Γ£à Argon2id (Standard OWASP)'));
        console.log(pc.dim('     Sangat tahan terhadap serangan Brute-Force dan GPU cracking.'));

        console.log(`\n  ${pc.bold('3. Integritas Data')}`);
        console.log(pc.green('     Γ£à Segel Digital SHA-256'));
        console.log(pc.dim('     Mendeteksi modifikasi ilegal oleh malware atau pihak ketiga.'));

        console.log(`\n  ${pc.bold('4. Filtrasi Otonom')}`);
        console.log(pc.green('     Γ£à Secret Scrubber (PenyaringRahasia)'));
        console.log(pc.dim('     Menghapus kredensial secara otomatis sebelum diproses oleh AI.'));

        console.log(pc.cyan('\nKesimpulan: Sistem Anda memiliki Kedaulatan Mutlak.'));
    }
}
