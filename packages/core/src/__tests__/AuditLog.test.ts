/**
 * AuditLog: the privacy report written next to the personal vault.
 *
 * The log is a transparency record, so what matters is that every call lands
 * exactly once as parseable JSON, that the file is owner-only, and that a
 * failure to write never propagates into the caller's operation. `AuditLog`
 * resolves the personal vault through `Context`, so `os.homedir` is redirected
 * here for the same reason as in `Context.test.ts`: no test may touch the
 * developer's real `~/.lembaranz`.
 */
import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { AuditLog } from '../AuditLog';

const LOG_FILE = 'audit-privasi.log';

const realOs = { ...os };
let fakeHome = '';

function setHome(dir: string): void {
    fakeHome = dir;
    mock.module('os', () => ({
        ...realOs,
        homedir: () => fakeHome,
        default: { ...realOs, homedir: () => fakeHome },
    }));
}

let tempDir: string;
let realCwd: string;

beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lembaranz-auditlog-'));
    realCwd = process.cwd();
    fakeHome = path.join(tempDir, 'home');
    await fs.mkdir(fakeHome, { recursive: true });
    setHome(fakeHome);
});

afterEach(async () => {
    process.chdir(realCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
});

/** The log path the module resolves through Context for the personal vault. */
function logPath(): string {
    return path.join(fakeHome, '.lembaranz', LOG_FILE);
}

async function readLines(): Promise<string[]> {
    const body = await fs.readFile(logPath(), 'utf-8');
    return body.split('\n').filter((l) => l.length > 0);
}

async function modeOf(p: string): Promise<number | null> {
    try {
        return (await fs.stat(p)).mode & 0o777;
    } catch {
        return null;
    }
}

describe('AuditLog.log', () => {
    test('writes one JSON line per call', async () => {
        await AuditLog.log('FIRST', { a: 1 });
        await AuditLog.log('SECOND', { b: 2 });

        const lines = await readLines();

        expect(lines).toHaveLength(2);
        const first = JSON.parse(lines[0]);
        const second = JSON.parse(lines[1]);
        expect(first.action).toBe('FIRST');
        expect(first.processedData).toEqual({ a: 1 });
        expect(second.action).toBe('SECOND');
        expect(second.processedData).toEqual({ b: 2 });
    }, 30000);

    test('stamps every entry with an ISO timestamp and the fixed source', async () => {
        await AuditLog.log('ONE', null);

        const entry = JSON.parse((await readLines())[0]);

        expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
        expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
        expect(entry.source).toBe('Sentinel Sovereign');
        expect(entry.privacyStatus).toBe('SCRUBBED');
    }, 30000);

    test('appends rather than overwriting', async () => {
        await AuditLog.log('A', 1);
        await AuditLog.log('B', 2);
        await AuditLog.log('C', 3);

        const lines = await readLines();

        expect(lines).toHaveLength(3);
        expect(lines.map((l) => JSON.parse(l).action)).toEqual(['A', 'B', 'C']);
    }, 30000);

    test('creates the log file 0600', async () => {
        await AuditLog.log('SECURE', { secret: 'value' });

        expect(await modeOf(logPath())).toBe(0o600);
    }, 30000);

    test('preserves 0600 across later appends', async () => {
        await AuditLog.log('ONE', 1);
        await fs.chmod(logPath(), 0o644);

        await AuditLog.log('TWO', 2);

        expect(await modeOf(logPath())).toBe(0o600);
    }, 30000);

    test('writes entries in chronological order', async () => {
        await AuditLog.log('EARLY', 1);
        await AuditLog.log('LATE', 2);

        const [first, second] = (await readLines()).map((l) => JSON.parse(l));

        expect(new Date(first.timestamp).getTime()).toBeLessThanOrEqual(
            new Date(second.timestamp).getTime(),
        );
    }, 30000);

    test('accepts payloads that are not plain objects', async () => {
        await AuditLog.log('STRINGS', 'a string');
        await AuditLog.log('NUMBER', 42);
        await AuditLog.log('NULL', null);
        await AuditLog.log('ARRAY', [1, 2, 3]);

        const lines = (await readLines()).map((l) => JSON.parse(l));

        expect(lines.map((e) => e.processedData)).toEqual([
            'a string',
            42,
            null,
            [1, 2, 3],
        ]);
    }, 30000);

    test('a payload with newlines stays on a single line', async () => {
        await AuditLog.log('MULTILINE', 'line one\nline two\r\nline three');

        const lines = await readLines();

        // One entry must never split into two lines or corrupt the log format.
        expect(lines).toHaveLength(1);
        expect(JSON.parse(lines[0]).processedData).toBe('line one\nline two\r\nline three');
    }, 30000);

    test('a payload with quotes and unicode round-trips', async () => {
        const payload = { text: 'he said "hi" \\ é 漢 🔑', n: 1 };
        await AuditLog.log('QUOTED', payload);

        const lines = await readLines();

        expect(JSON.parse(lines[0]).processedData).toEqual(payload);
    }, 30000);

    test('the log lands beside the personal vault, not in the project', async () => {
        const project = path.join(tempDir, 'project');
        await fs.mkdir(path.join(project, '.lembaranz'), { recursive: true });
        await fs.writeFile(path.join(project, 'package.json'), '{}', 'utf-8');
        process.chdir(project);

        await AuditLog.log('LOCATION', 1);

        expect(await fs.readFile(logPath(), 'utf-8')).toContain('LOCATION');
        expect(
            await fs
                .access(path.join(project, '.lembaranz', LOG_FILE))
                .then(() => true)
                .catch(() => false),
        ).toBe(false);
    }, 30000);

    test('does not throw when the log cannot be written', async () => {
        // Put a directory where the log file should go, so every write fails.
        const dir = path.join(fakeHome, '.lembaranz');
        await fs.mkdir(dir, { recursive: true });
        await fs.mkdir(path.join(dir, LOG_FILE), { recursive: true });

        // A transparency log must never be able to break the operation it was
        // recording, so this resolves rather than throwing.
        await expect(AuditLog.log('WILL_FAIL', { a: 1 })).resolves.toBeUndefined();
    }, 30000);
});

describe('AuditLog.readLog', () => {
    test('reports the empty case when no log exists', async () => {
        const body = await AuditLog.readLog();

        expect(typeof body).toBe('string');
        expect(body.length).toBeGreaterThan(0);
        // Nothing recorded yet, and nothing that looks like a parsed entry.
        expect(() => JSON.parse(body)).toThrow();
    }, 30000);

    test('returns exactly what was written', async () => {
        await AuditLog.log('ROUND_TRIP', { value: 'kept' });

        const body = await AuditLog.readLog();

        expect(body).toBe(await fs.readFile(logPath(), 'utf-8'));
        const entries = body.split('\n').filter(Boolean).map((l) => JSON.parse(l));
        expect(entries).toHaveLength(1);
        expect(entries[0].processedData).toEqual({ value: 'kept' });
    }, 30000);

    test('returns the empty case rather than throwing on a browser', async () => {
        const g = globalThis as Record<string, unknown>;
        g.window = {};
        try {
            const body = await AuditLog.readLog();
            expect(typeof body).toBe('string');
            expect(body.length).toBeGreaterThan(0);
        } finally {
            delete g.window;
        }
    }, 30000);
});

describe('AuditLog in a browser environment', () => {
    test('log is a no-op when window is defined', async () => {
        const g = globalThis as Record<string, unknown>;
        g.window = {};
        try {
            await expect(AuditLog.log('BROWSER', { a: 1 })).resolves.toBeUndefined();
        } finally {
            delete g.window;
        }

        // No log file may be created in a browser build.
        expect(
            await fs
                .access(logPath())
                .then(() => true)
                .catch(() => false),
        ).toBe(false);
    }, 30000);
});