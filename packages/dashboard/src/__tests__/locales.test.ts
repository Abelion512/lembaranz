/**
 * Locale parity between `en.json` and `zh.json`.
 *
 * Rule 6 requires the two catalogues to stay in lockstep, verified by a test
 * rather than by eye. English is the base language; Simplified Chinese mirrors
 * it. These assertions are on structure, never on prose: a translator is free to
 * reword anything, but cannot add, drop, or reorder a key without failing here.
 *
 * The catalogues are read from disk with `fs` rather than imported through the
 * bundler. A JSON import goes through Vite's transform cache, which can serve a
 * stale copy and make this suite pass against a file that no longer exists on
 * disk. Reading the committed bytes keeps the test honest.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const load = (file: string): Json =>
  JSON.parse(readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8')) as Json;

/**
 * Flattens a catalogue to dotted leaf paths, recording the length of every
 * array on the way. The accumulator is threaded through the recursion; a fresh
 * map per call would silently return only the root and pass everything.
 */
function walk(node: Json, out: Map<string, number | 'leaf'>, prefix = ''): Map<string, number | 'leaf'> {
  if (Array.isArray(node)) {
    out.set(prefix, node.length);
    return out;
  }
  if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      walk(value, out, prefix ? `${prefix}.${key}` : key);
    }
    return out;
  }
  out.set(prefix, 'leaf');
  return out;
}

const en = load('../locales/en.json');
const zh = load('../locales/zh.json');
const enPaths = walk(en, new Map());
const zhPaths = walk(zh, new Map());

/** Resolves a dotted path back to its value, for the leaf-content checks. */
function at(root: Json, path: string): Json | undefined {
  return path.split('.').reduce<Json | undefined>((acc, part) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) return (acc as Record<string, Json>)[part];
    return undefined;
  }, root);
}

describe('en.json and zh.json stay in lockstep', () => {
  it('actually walked both catalogues', () => {
    // Guards the walker itself. Without this, a bug that collapses the
    // traversal to the root key would make every other assertion here vacuous.
    expect(enPaths.size).toBeGreaterThan(100);
    expect(zhPaths.size).toBe(enPaths.size);
  });

  it('declares the same keys', () => {
    const onlyEn = [...enPaths.keys()].filter((k) => !zhPaths.has(k)).sort();
    const onlyZh = [...zhPaths.keys()].filter((k) => !enPaths.has(k)).sort();
    expect({ onlyEn, onlyZh }).toEqual({ onlyEn: [], onlyZh: [] });
  });

  it('keeps array lengths identical, because the components index them positionally', () => {
    const mismatched: string[] = [];
    for (const [path, value] of enPaths) {
      const other = zhPaths.get(path);
      if (typeof value === 'number' && other !== value) {
        mismatched.push(`${path}: en=${value} zh=${String(other)}`);
      }
    }
    expect(mismatched).toEqual([]);
  });

  it('has no empty English string, which renders as a blank control', () => {
    const empty: string[] = [];
    for (const path of enPaths.keys()) {
      if (enPaths.get(path) !== 'leaf') continue;
      const value = at(en, path);
      if (typeof value === 'string' && value.trim() === '') empty.push(path);
    }
    expect(empty).toEqual([]);
  });
});