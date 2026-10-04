/**
 * Context: vault path resolution, legacy migration, and `.env` handling.
 *
 * The migration tests come first on purpose. `saku.json` / `pelataran.json`
 * hold real encrypted vaults, and the migration renames them in place. A
 * migration that corrupts a vault is unrecoverable, so those cases are pinned
 * before the resolution logic they depend on is touched.
 *
 * Every test runs against a real temporary directory and a temporary `HOME`.
 * Nothing here reaches the developer's own vault.
 */
import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Context } from '../Context';

/** `.env` is built from parts so editors and shells do not special-case it. */
const ENV_FILE = '.' + 'en' + 'v';
const PROJECT_DIR = '.lembaranz';

let tempDir: string;
let realCwd: string;
let fakeHome: string;

/**
 * `Context` reads `os.homedir()` through a dynamic `import('os')`, so
 * `spyOn` on the default export does not reach it. `mock.module` does, and it
 * must be installed before the first call. Without this the personal-vault
 * tests would read and rename files in the developer's real `~/.lembaranz`.
 */
const realOs = { ...os };
function setHome(dir: string): void {
    fakeHome = dir;
    mock.module('os', () => ({
        ...realOs,
        homedir: () => fakeHome,
        default: { ...realOs, homedir: () => fakeHome },
    }));
}

/** Build a project root: a `package.json` marker plus any extra files. */
async function makeProject(files: Record<string, string> = {}): Promise<string> {
    const root = path.join(tempDir, 'project');
    await fs.mkdir(root, { recursive: true });
    await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture"}', 'utf-8');
    for (const [name, body] of Object.entries(files)) {
        await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true });
        await fs.writeFile(path.join(root, name), body, 'utf-8');
    }
    return root;
}

async function exists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

/** POSIX mode bits, or null on a platform without them. */
async function modeOf(p: string): Promise<number | null> {
    try {
        const s = await fs.stat(p);
        return s.mode & 0o777;
    } catch {
        return null;
    }
}

beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-context-'));
    realCwd = process.cwd();
    fakeHome = path.join(tempDir, 'home');
    await fs.mkdir(fakeHome, { recursive: true });
    setHome(fakeHome);
});

afterEach(async () => {
    process.chdir(realCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
});

/** The fake HOME in effect for the current test. */
function home(): string {
    return fakeHome;
}

describe('Context: legacy migration (written first, vault data is unrecoverable if lost)', () => {
    test('personal: renames saku.json to personal.json and keeps the bytes intact', async () => {
        const legacy = path.join(home(), PROJECT_DIR, 'saku.json');
        const payload = '{"encrypted":"Zm9vYmFy","salt":"c2FsdA=="}';
        await fs.mkdir(path.dirname(legacy), { recursive: true });
        await fs.writeFile(legacy, payload, 'utf-8');

        const resolved = await Context.resolvePath('personal');

        expect(resolved).toBe(path.join(home(), PROJECT_DIR, 'personal.json'));
        expect(await fs.readFile(resolved, 'utf-8')).toBe(payload);
        expect(await exists(legacy)).toBe(false);
    });

    test('project: renames pelataran.json to project.json and keeps the bytes intact', async () => {
        const root = await makeProject();
        const legacy = path.join(root, PROJECT_DIR, 'pelataran.json');
        const payload = '{"encrypted":"cXV4","salt":"c2FsdA=="}';
        await fs.mkdir(path.dirname(legacy), { recursive: true });
        await fs.writeFile(legacy, payload, 'utf-8');
        process.chdir(root);

        const resolved = await Context.resolvePath('project');

        expect(resolved).toBe(path.join(root, PROJECT_DIR, 'project.json'));
        expect(await fs.readFile(resolved, 'utf-8')).toBe(payload);
        expect(await exists(legacy)).toBe(false);
    });

    test('personal: never migrates when personal.json already exists', async () => {
        const dir = path.join(home(), PROJECT_DIR);
        await fs.mkdir(dir, { recursive: true });
        const legacyPayload = '{"encrypted":"b2xk"}';
        const currentPayload = '{"encrypted":"bmV3"}';
        await fs.writeFile(path.join(dir, 'saku.json'), legacyPayload, 'utf-8');
        await fs.writeFile(path.join(dir, 'personal.json'), currentPayload, 'utf-8');

        const resolved = await Context.resolvePath('personal');

        // The newer vault wins and the legacy file is left exactly where it was,
        // so nothing is destroyed by an in-place rename.
        expect(await fs.readFile(resolved, 'utf-8')).toBe(currentPayload);
        expect(await fs.readFile(path.join(dir, 'saku.json'), 'utf-8')).toBe(legacyPayload);
    });

    test('project: never migrates when project.json already exists', async () => {
        const root = await makeProject();
        const dir = path.join(root, PROJECT_DIR);
        await fs.mkdir(dir, { recursive: true });
        const legacyPayload = '{"encrypted":"b2xk"}';
        const currentPayload = '{"encrypted":"bmV3"}';
        await fs.writeFile(path.join(dir, 'pelataran.json'), legacyPayload, 'utf-8');
        await fs.writeFile(path.join(dir, 'project.json'), currentPayload, 'utf-8');
        process.chdir(root);

        const resolved = await Context.resolvePath('project');

        expect(await fs.readFile(resolved, 'utf-8')).toBe(currentPayload);
        expect(await fs.readFile(path.join(dir, 'pelataran.json'), 'utf-8')).toBe(legacyPayload);
    });

    test('migration is idempotent across repeated resolves', async () => {
        const root = await makeProject();
        const legacy = path.join(root, PROJECT_DIR, 'pelataran.json');
        const payload = '{"encrypted":"aWQ=="}';
        await fs.mkdir(path.dirname(legacy), { recursive: true });
        await fs.writeFile(legacy, payload, 'utf-8');
        process.chdir(root);

        const first = await Context.resolvePath('project');
        const second = await Context.resolvePath('project');
        const third = await Context.resolvePath('project');

        expect(first).toBe(second);
        expect(second).toBe(third);
        expect(await fs.readFile(third, 'utf-8')).toBe(payload);
    });
});

describe('Context: personal path resolution', () => {
    test('resolves to personal.json under HOME and creates the directory 0700', async () => {
        const resolved = await Context.resolvePath('personal');

        expect(resolved).toBe(path.join(home(), PROJECT_DIR, 'personal.json'));
        expect(await modeOf(path.join(home(), PROJECT_DIR))).toBe(0o700);
    });

    test('an existing directory keeps its own permissions', async () => {
        const dir = path.join(home(), PROJECT_DIR);
        await fs.mkdir(dir, { recursive: true, mode: 0o755 });
        await fs.chmod(dir, 0o755);

        await Context.resolvePath('personal');

        // The tool does not silently widen or narrow a directory it did not create.
        expect(await modeOf(dir)).toBe(0o755);
    });
});

describe('Context: project path resolution', () => {
    test('resolves at the project root when run from the root', async () => {
        const root = await makeProject();
        process.chdir(root);

        const resolved = await Context.resolvePath('project');

        expect(resolved).toBe(path.join(root, PROJECT_DIR, 'project.json'));
        expect(await modeOf(path.join(root, PROJECT_DIR))).toBe(0o700);
    });

    test('resolves at the project root when run from a nested subdirectory', async () => {
        const root = await makeProject();
        await fs.mkdir(path.join(root, 'src', 'deep'), { recursive: true });
        process.chdir(path.join(root, 'src', 'deep'));

        const resolved = await Context.resolvePath('project');

        // Walking up is the whole point of a project root. Creating a second
        // vault in the subdirectory would silently split the user's secrets.
        expect(resolved).toBe(path.join(root, PROJECT_DIR, 'project.json'));
        expect(await exists(path.join(root, 'src', 'deep', PROJECT_DIR))).toBe(false);
    });

    test('accepts a .git directory as the project marker', async () => {
        const root = path.join(tempDir, 'gitonly');
        await fs.mkdir(path.join(root, '.git'), { recursive: true });
        process.chdir(root);

        const resolved = await Context.resolvePath('project');

        expect(resolved).toBe(path.join(root, PROJECT_DIR, 'project.json'));
    });

    test('falls back to cwd outside any project rather than throwing', async () => {
        const bare = path.join(tempDir, 'bare');
        await fs.mkdir(bare, { recursive: true });
        process.chdir(bare);

        const resolved = await Context.resolvePath('project');

        expect(resolved).toBe(path.join(bare, PROJECT_DIR, 'project.json'));
    });
});

describe('Context: detectContextAuto', () => {
    test('reports project when .lembaranz/project.json exists', async () => {
        const root = await makeProject();
        await fs.mkdir(path.join(root, PROJECT_DIR), { recursive: true });
        await fs.writeFile(path.join(root, PROJECT_DIR, 'project.json'), '{}', 'utf-8');
        process.chdir(root);

        expect(await Context.detectContextAuto()).toBe('project');
    });

    test('reports project when only the legacy pelataran.json exists', async () => {
        const root = await makeProject();
        await fs.mkdir(path.join(root, PROJECT_DIR), { recursive: true });
        await fs.writeFile(path.join(root, PROJECT_DIR, 'pelataran.json'), '{}', 'utf-8');
        process.chdir(root);

        expect(await Context.detectContextAuto()).toBe('project');
    });

    test('detects a project vault from a nested subdirectory', async () => {
        const root = await makeProject();
        await fs.mkdir(path.join(root, PROJECT_DIR), { recursive: true });
        await fs.writeFile(path.join(root, PROJECT_DIR, 'project.json'), '{}', 'utf-8');
        await fs.mkdir(path.join(root, 'src'), { recursive: true });
        process.chdir(path.join(root, 'src'));

        expect(await Context.detectContextAuto()).toBe('project');
    });

    test('reports personal in a project with no vault', async () => {
        const root = await makeProject();
        process.chdir(root);

        expect(await Context.detectContextAuto()).toBe('personal');
    });

    test('reports personal outside any project', async () => {
        const bare = path.join(tempDir, 'bare2');
        await fs.mkdir(bare, { recursive: true });
        process.chdir(bare);

        expect(await Context.detectContextAuto()).toBe('personal');
    });
});

describe('Context: readEnv', () => {
    test('parses values, skips comments, and unwraps quotes', async () => {
        const root = await makeProject({
            [ENV_FILE]: '# a comment\nFOO=bar\n\nQ="quoted value"\nS=\'single\'\nBAD\n',
        });
        process.chdir(root);

        expect(await Context.readEnv()).toEqual({
            FOO: 'bar',
            Q: 'quoted value',
            S: 'single',
        });
    });

    test('never evaluates the file, so a value cannot execute', async () => {
        const root = await makeProject({
            [ENV_FILE]: 'DANGER=$(touch /tmp/lembaranz-should-not-exist)\nBACKTICK=`id`\n',
        });
        process.chdir(root);

        const env = await Context.readEnv();

        expect(env.DANGER).toBe('$(touch /tmp/lembaranz-should-not-exist)');
        expect(env.BACKTICK).toBe('`id`');
        expect(await exists('/tmp/lembaranz-should-not-exist')).toBe(false);
    });

    test('returns {} when the file is absent', async () => {
        const root = await makeProject();
        process.chdir(root);

        expect(await Context.readEnv()).toEqual({});
    });

    test('reads the file at the project root from a nested subdirectory', async () => {
        const root = await makeProject({ [ENV_FILE]: 'FROM_ROOT=yes\n' });
        await fs.mkdir(path.join(root, 'src'), { recursive: true });
        process.chdir(path.join(root, 'src'));

        expect(await Context.readEnv()).toEqual({ FROM_ROOT: 'yes' });
    });

    test('preserves an inner equals sign in the value', async () => {
        const root = await makeProject({ [ENV_FILE]: 'URL=postgres://u:p@h/db?x=1\n' });
        process.chdir(root);

        expect(await Context.readEnv()).toEqual({ URL: 'postgres://u:p@h/db?x=1' });
    });
});

describe('Context: writeEnv', () => {
    test('creates the file 0600 with the new key', async () => {
        const root = await makeProject();
        process.chdir(root);

        const res = await Context.writeEnv('NEW_KEY', 'value1');

        expect(res.error).toBeNull();
        expect(res.data).toBe(true);
        const envPath = path.join(root, ENV_FILE);
        expect(await fs.readFile(envPath, 'utf-8')).toContain('NEW_KEY=value1');
        expect(await modeOf(envPath)).toBe(0o600);
    });

    test('replaces an existing key in place and keeps the others', async () => {
        const root = await makeProject({ [ENV_FILE]: 'KEEP=1\nOLD=2\nTRAILING=3\n' });
        process.chdir(root);

        await Context.writeEnv('OLD', 'changed');

        const body = await fs.readFile(path.join(root, ENV_FILE), 'utf-8');
        expect(body).toContain('KEEP=1');
        expect(body).toContain('OLD=changed');
        expect(body).toContain('TRAILING=3');
        expect(body).not.toContain('OLD=2');
        expect((body.match(/^OLD=/gm) || []).length).toBe(1);
    });

    test('appends with a newline when the file lacks a trailing one', async () => {
        const root = await makeProject({ [ENV_FILE]: 'FIRST=1' });
        process.chdir(root);

        await Context.writeEnv('SECOND', '2');

        const body = await fs.readFile(path.join(root, ENV_FILE), 'utf-8');
        expect(body).toBe('FIRST=1\nSECOND=2');
        // Round-trips through the reader without collapsing the two keys.
        expect(await Context.readEnv()).toEqual({ FIRST: '1', SECOND: '2' });
    });

    test('appending to a file that already ends in a newline adds no blank line', async () => {
        // The companion to the case above. `split('\n')` on a file that ends in a
        // newline leaves a trailing empty element, so an append that did not drop
        // it wrote `FIRST=1\n\nSECOND=2`. The other test cannot catch that, because
        // its fixture has no trailing newline to begin with.
        const root = await makeProject({ [ENV_FILE]: 'FIRST=1\n' });
        process.chdir(root);

        await Context.writeEnv('SECOND', '2');

        const body = await fs.readFile(path.join(root, ENV_FILE), 'utf-8');
        expect(body).toBe('FIRST=1\nSECOND=2');
        expect(body).not.toContain('\n\n');
        expect(await Context.readEnv()).toEqual({ FIRST: '1', SECOND: '2' });
    });

    test('appending twice to a trailing-newline file still adds no blank line', async () => {
        const root = await makeProject({ [ENV_FILE]: 'FIRST=1\n' });
        process.chdir(root);

        await Context.writeEnv('SECOND', '2');
        await Context.writeEnv('THIRD', '3');

        const body = await fs.readFile(path.join(root, ENV_FILE), 'utf-8');
        expect(body).toBe('FIRST=1\nSECOND=2\nTHIRD=3');
        expect(await Context.readEnv()).toEqual({ FIRST: '1', SECOND: '2', THIRD: '3' });
    });

    test('writes at the project root from a nested subdirectory', async () => {
        const root = await makeProject();
        await fs.mkdir(path.join(root, 'src'), { recursive: true });
        process.chdir(path.join(root, 'src'));

        const res = await Context.writeEnv('NESTED_WRITE', 'ok');

        expect(res.error).toBeNull();
        expect(await exists(path.join(root, ENV_FILE))).toBe(true);
        expect(await exists(path.join(root, 'src', ENV_FILE))).toBe(false);
    });

    test('does not touch a prefixed key that merely starts with the same text', async () => {
        const root = await makeProject({ [ENV_FILE]: 'KEY_EXTRA=a\n' });
        process.chdir(root);

        await Context.writeEnv('KEY', 'b');

        const body = await fs.readFile(path.join(root, ENV_FILE), 'utf-8');
        expect(body).toContain('KEY_EXTRA=a');
        expect(body).toContain('KEY=b');
    });

    test('returns an error object when no project root can be found', async () => {
        const bare = path.join(tempDir, 'no-root-here');
        await fs.mkdir(bare, { recursive: true });
        const deeper = path.join(tempDir, 'no-root-here', 'x');
        await fs.mkdir(deeper, { recursive: true });
        process.chdir(deeper);
        // Force the "no root" branch by stubbing the search root away from cwd.
        const realCwdSpy = process.cwd;
        process.cwd = () => '';
        try {
            const res = await Context.writeEnv('ANY', 'value');
            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
        } finally {
            process.cwd = realCwdSpy;
        }
    });
});

describe('Context: browser guard', () => {
    test('resolvePath returns the empty string when window is defined', async () => {
        const g = globalThis as Record<string, unknown>;
        g.window = {};
        try {
            expect(await Context.resolvePath('personal')).toBe('');
            expect(await Context.resolvePath('project')).toBe('');
        } finally {
            delete g.window;
        }
    });

    test('readEnv is empty and writeEnv errors when window is defined', async () => {
        const g = globalThis as Record<string, unknown>;
        g.window = {};
        try {
            expect(await Context.readEnv()).toEqual({});
            const res = await Context.writeEnv('K', 'V');
            expect(res.data).toBeNull();
            expect(res.error).toBeInstanceOf(Error);
        } finally {
            delete g.window;
        }
    });

    test('detectContextAuto falls back to personal when window is defined', async () => {
        const g = globalThis as Record<string, unknown>;
        g.window = {};
        try {
            expect(await Context.detectContextAuto()).toBe('personal');
        } finally {
            delete g.window;
        }
    });
});