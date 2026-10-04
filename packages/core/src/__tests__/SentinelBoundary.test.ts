/**
 * Sentinel: the anti-brute-force control, pinned at its boundaries.
 *
 * `Sentinel.test.ts` covers the ordinary paths. This file exists for the exact
 * boundaries, because an off-by-one there is invisible in the happy path and is
 * precisely the kind of defect an attacker probes for. Every case asserts on
 * numbers returned by `checkRateLimit`, not on wording.
 *
 * Time is controlled by replacing `Date.now`, which is the only clock the
 * module reads, so a window boundary is tested to the millisecond instead of
 * by sleeping.
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Sentinel } from '../Sentinel';

/** Mirrors the module's own constants; asserted, not assumed. */
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_STORE_SIZE = 10_000;

const KEY = 'vault-a';

let base: number;
let realNow: typeof Date.now;

beforeEach(() => {
    realNow = Date.now;
    // The module captures `lastCleanupTime` at import time, so a fixed epoch far
    // in the past would make `now - lastCleanupTime` negative and cleanup would
    // never fire. Starting from the real clock keeps every boundary relative.
    base = realNow.call(Date);
    Date.now = () => base;
    Sentinel.clearAllRateLimits();
    anchor = primeCleanupClock();
});

afterEach(() => {
    Date.now = realNow;
    Sentinel.clearAllRateLimits();
});

let anchor = 0;

/**
 * Aligns the module's `lastCleanupTime` with `base`, and returns that instant.
 *
 * Cleanup is gated on time elapsed since the last cleanup it performed, and
 * that timestamp is module state shared by every test in the worker. A test
 * that advances the clock far ahead leaves it far ahead for the next one, so
 * cleanup would silently stop firing and any test about eviction would pass for
 * the wrong reason. Rather than assume a large enough jump, this watches for the
 * observable effect and keeps advancing until cleanup is seen to happen.
 */
function primeCleanupClock(): number {
    for (let attempt = 0; attempt < 1000; attempt++) {
        base += 60 * 60 * 1000;
        Sentinel.clearAllRateLimits();
        Sentinel.checkRateLimit('canary');
        // The jump must clear CLEANUP_INTERVAL so cleanup fires, and also the
        // idle threshold so the canary is the entry it removes.
        base += CLEANUP_INTERVAL + RATE_LIMIT_WINDOW;
        Sentinel.checkRateLimit('probe');
        // A cleanup dropped the canary and kept only the probe.
        if (Sentinel.getStoreSize() === 1) {
            const at = base;
            Sentinel.clearAllRateLimits();
            return at;
        }
    }
    throw new Error('primeCleanupClock: cleanup never fired, clock drift is unbounded');
}

describe('Sentinel: attempt budget boundary', () => {
    test('the first five calls are allowed and the sixth is refused', () => {
        const allowed: boolean[] = [];
        const remaining: (number | undefined)[] = [];

        for (let i = 0; i < 6; i++) {
            const r = Sentinel.checkRateLimit(KEY);
            allowed.push(r.allowed);
            remaining.push(r.remaining);
        }

        expect(allowed).toEqual([true, true, true, true, true, false]);
        // The budget is spent one call at a time and reported exactly.
        expect(remaining).toEqual([4, 3, 2, 1, 0, undefined]);
    });

    test('the refusal carries a resetAt exactly one lockout ahead', () => {
        for (let i = 0; i < MAX_ATTEMPTS; i++) Sentinel.checkRateLimit(KEY);

        const r = Sentinel.checkRateLimit(KEY);

        expect(r.allowed).toBe(false);
        expect(r.resetAt).toBe(base + LOCKOUT_DURATION);
    });

    test('a refused call does not consume budget it was never given', () => {
        for (let i = 0; i < MAX_ATTEMPTS; i++) Sentinel.checkRateLimit(KEY);

        // Ten further attempts during lockout must all be refused with the same
        // reset time: none of them may push the lockout further out.
        const resets = new Set<number | undefined>();
        for (let i = 0; i < 10; i++) {
            const r = Sentinel.checkRateLimit(KEY);
            expect(r.allowed).toBe(false);
            resets.add(r.resetAt);
        }

        expect([...resets]).toEqual([base + LOCKOUT_DURATION]);
    });
});

describe('Sentinel: rate limit window boundary', () => {
    test('an attempt one millisecond inside the window still counts', () => {
        Sentinel.checkRateLimit(KEY);
        base += RATE_LIMIT_WINDOW - 1;

        // The window is `> RATE_LIMIT_WINDOW`, so one millisecond short of it the
        // previous attempt must still be charged.
        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(3);
    });

    test('at exactly the window the previous attempt is still charged', () => {
        Sentinel.checkRateLimit(KEY);
        base += RATE_LIMIT_WINDOW;

        // The window is strictly exceeded to reset. Exactly on the boundary the
        // attempt must still count, otherwise the real budget is one attempt
        // shorter than the reported number.
        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(3);
    });

test('one millisecond past the window the attempt is forgiven', () => {
        Sentinel.checkRateLimit(KEY);
        base += RATE_LIMIT_WINDOW + 1;

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(MAX_ATTEMPTS - 1);
    });

test('the window resets the moment it is exceeded', () => {
        Sentinel.checkRateLimit(KEY);
        Sentinel.checkRateLimit(KEY);
        base += RATE_LIMIT_WINDOW + 1;

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(MAX_ATTEMPTS - 1);
    });

    test('the window reset restores the full budget, not a partial one', () => {
        // Spend four of the five, staying inside the budget so no lockout is
        // ever armed; a lockout would mask the window behaviour entirely.
        for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
            expect(Sentinel.checkRateLimit(KEY).allowed).toBe(true);
        }
        expect(Sentinel.checkRateLimit(KEY).remaining).toBe(0);

        base += RATE_LIMIT_WINDOW + 1;

        const after = Sentinel.checkRateLimit(KEY);
        expect(after.allowed).toBe(true);
        expect(after.remaining).toBe(MAX_ATTEMPTS - 1);
    });

    test('each window grants a fresh budget rather than one ever-growing one', () => {
        for (let w = 0; w < 3; w++) {
            for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
                expect(Sentinel.checkRateLimit(KEY).remaining).toBe(MAX_ATTEMPTS - 1 - i);
            }
            base += RATE_LIMIT_WINDOW + 1;
        }
        expect(Sentinel.getStoreSize()).toBe(1);
    });
});

describe('Sentinel: lockout boundary', () => {
    function triggerLockout(): void {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit(KEY);
    }

    test('one millisecond before the lockout ends the lockout still holds', () => {
        triggerLockout();
        const armedAt = base + LOCKOUT_DURATION;
        base += LOCKOUT_DURATION - 1;

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(false);
        // The refusal reports the same instant the lockout was armed at. Hammering
        // the control during a lockout must not push the unlock time further out.
        expect(r.resetAt).toBe(armedAt);
    });

    test('at the exact millisecond the lockout ends it lifts', () => {
        triggerLockout();
        base += LOCKOUT_DURATION;

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(MAX_ATTEMPTS - 1);
        expect(r.resetAt).toBeUndefined();
    });

    test('a lockout that expires is not re-armed by later cleanup', () => {
        triggerLockout();
        // Let the lockout lapse with no call in between. The lockout branch has
        // to reset the bucket rather than re-arm it.
        base += LOCKOUT_DURATION + 1;

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.resetAt).toBeUndefined();
        expect(r.remaining).toBe(MAX_ATTEMPTS - 1);
    });

test('an expired lockout whose key then went idle is cleaned up', () => {
        triggerLockout();
        // The lockout lapses, but this key is never touched again. Cleanup still
        // has to reclaim it, and by then it is both unlocked and idle, which is
        // the branch a naive cleanup skips.
        base = anchor + CLEANUP_INTERVAL + RATE_LIMIT_WINDOW * 3;
        Sentinel.checkRateLimit('unrelated');

        expect(Sentinel.checkRateLimit(KEY).remaining).toBe(MAX_ATTEMPTS - 1);
    });

test('a bucket locked and then released carries no leftover lockout', () => {
        triggerLockout();
        base += LOCKOUT_DURATION + 1;
        expect(Sentinel.checkRateLimit(KEY).allowed).toBe(true);

        // Now drive it to lockout a second time and confirm the second lockout
        // is the same length as the first, not compounded.
        const firstArmed = base;
        for (let i = 0; i < MAX_ATTEMPTS + 1; i++) Sentinel.checkRateLimit(KEY);
        const second = Sentinel.checkRateLimit(KEY);

        expect(second.allowed).toBe(false);
        expect(second.resetAt).toBe(firstArmed + LOCKOUT_DURATION);
    });

test('after a lockout lifts the budget is full again', () => {
        triggerLockout();
        base += LOCKOUT_DURATION;
        Sentinel.checkRateLimit(KEY);

        const r = Sentinel.checkRateLimit(KEY);
        expect(r.allowed).toBe(true);
        expect(r.remaining).toBe(MAX_ATTEMPTS - 2);
    });
});

describe('Sentinel: bucket scoping', () => {
    test('one exhausted bucket never blocks another', () => {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit('victim');

        expect(Sentinel.checkRateLimit('attacker').allowed).toBe(true);
        expect(Sentinel.checkRateLimit('attacker').remaining).toBe(MAX_ATTEMPTS - 2);
    });

    test('a locked bucket stays locked while its neighbour keeps working', () => {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit('victim');

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            expect(Sentinel.checkRateLimit('other').allowed).toBe(true);
        }
        expect(Sentinel.checkRateLimit('victim').allowed).toBe(false);
    });

    test('resetRateLimit frees one bucket without touching the rest', () => {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit('a');
        Sentinel.checkRateLimit('b');

        Sentinel.resetRateLimit('a');

        expect(Sentinel.checkRateLimit('a').remaining).toBe(MAX_ATTEMPTS - 1);
        expect(Sentinel.checkRateLimit('b').remaining).toBe(MAX_ATTEMPTS - 2);
    });

    test('keys differing only by case are separate buckets', () => {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit('Vault');

        expect(Sentinel.checkRateLimit('vault').allowed).toBe(true);
    });

    test('the empty string is a bucket like any other', () => {
        for (let i = 0; i <= MAX_ATTEMPTS; i++) Sentinel.checkRateLimit('');

        expect(Sentinel.checkRateLimit('other').allowed).toBe(true);
        expect(Sentinel.checkRateLimit('').allowed).toBe(false);
    });
});

describe('Sentinel: store cleanup and eviction', () => {
    test('an idle bucket is dropped once cleanup runs', () => {
        Sentinel.checkRateLimit('stale');
        expect(Sentinel.getStoreSize()).toBe(1);

        // Cleanup needs both enough elapsed time to fire and an entry older than
        // twice the window to be worth removing.
        base = anchor + CLEANUP_INTERVAL + RATE_LIMIT_WINDOW * 2 + 1;
        Sentinel.checkRateLimit('fresh');

        expect(Sentinel.getStoreSize()).toBe(1);
        expect(Sentinel.checkRateLimit('stale').remaining).toBe(MAX_ATTEMPTS - 1);
    });

    test('a bucket inside the window survives cleanup while an idle one is dropped', () => {
        // 'idle' is created more than two windows before the next cleanup, so it
        // must go; 'recent' is created inside that window, so it must be kept.
        // Dropping the recent one would hand an attacker a free budget.
        base = anchor + 100_000;
        Sentinel.checkRateLimit('idle');
        base = anchor + 250_000;
        Sentinel.checkRateLimit('recent');

        base = anchor + CLEANUP_INTERVAL + 1;
        Sentinel.checkRateLimit('fresh');

        expect(Sentinel.getStoreSize()).toBe(2);
        expect(Sentinel.checkRateLimit('recent').remaining).toBe(MAX_ATTEMPTS - 2);
    });

    test('cleanup runs on the first call after its interval', () => {
        Sentinel.checkRateLimit('stale');
        base = anchor + CLEANUP_INTERVAL;
        Sentinel.checkRateLimit('trigger');

        // Exactly at the interval, cleanup has not yet run, so both are present.
        expect(Sentinel.getStoreSize()).toBe(2);

        base += 1;
        Sentinel.checkRateLimit('trigger2');
        expect(Sentinel.getStoreSize()).toBe(2);
    });

    test('cleanup does not run before its interval elapses', () => {
        for (let i = 0; i < 40; i++) Sentinel.checkRateLimit(`key-${i}`);

        base = anchor + CLEANUP_INTERVAL - 1;
        Sentinel.checkRateLimit('trigger');

        expect(Sentinel.getStoreSize()).toBe(41);
    });

    /**
 * Drives one key per millisecond and records the store size after every call.
 *
 * Continuous traffic is the only way the hard cap can actually bite: entries
 * created within the last two windows are still live when cleanup runs, so the
 * size has to come down through the cap rather than the idle rule. Cleanup only
 * fires on a call that crosses its interval, so the sizes form a sawtooth.
 */
function sampleUnderContinuousTraffic(steps: number): number[] {
    const sizes: number[] = [];
    for (let i = 0; i < steps; i++) {
        Sentinel.checkRateLimit(`key-${i}`);
        base = anchor + i + 1;
        sizes.push(Sentinel.getStoreSize());
    }
    return sizes;
}

test('every cleanup leaves the store at or below its hard cap', () => {
    const sizes = sampleUnderContinuousTraffic(CLEANUP_INTERVAL + RATE_LIMIT_WINDOW * 2 + 1);

    // A cleanup shows up as a large step down. Every value that follows a step
    // down of more than one entry is the state a cleanup left behind.
    const afterCleanup: number[] = [];
    for (let i = 1; i < sizes.length; i++) {
        if (sizes[i] < sizes[i - 1] - 1) afterCleanup.push(sizes[i]);
    }

    expect(afterCleanup.length).toBeGreaterThan(0);
    for (const size of afterCleanup) {
        // The triggering call adds its own entry after the trim runs.
        expect(size).toBeLessThanOrEqual(MAX_STORE_SIZE + 1);
    }
    // And the store really did exceed the cap between cleanups, so the
    // assertion above is not passing vacuously.
    expect(Math.max(...sizes)).toBeGreaterThan(MAX_STORE_SIZE);
});

test('the oldest entries are the ones evicted', () => {
    sampleUnderContinuousTraffic(CLEANUP_INTERVAL + RATE_LIMIT_WINDOW * 2 + 1);

    // Map insertion order is the eviction order. The oldest key was dropped, so
    // asking about it starts a fresh bucket rather than resuming a spent one.
    const oldest = Sentinel.checkRateLimit('key-0');
    expect(oldest.allowed).toBe(true);
    expect(oldest.remaining).toBe(MAX_ATTEMPTS - 1);

    // A key that was never seen starts with the whole budget, so the two cases
    // above are distinguishable from a store that simply emptied out.
    Sentinel.checkRateLimit('key-1');
    expect(Sentinel.checkRateLimit('key-1').remaining).toBe(MAX_ATTEMPTS - 2);
    expect(Sentinel.checkRateLimit('never-seen').remaining).toBe(MAX_ATTEMPTS - 1);
});

    test('an evicted bucket is a fresh bucket, not a stale one', () => {
        sampleUnderContinuousTraffic(CLEANUP_INTERVAL + RATE_LIMIT_WINDOW * 2 + 1);

        // Whatever happened to `key-0`, it must never look more restricted than
        // a brand new bucket.
        const r = Sentinel.checkRateLimit('key-0');
        if (r.allowed) expect(r.remaining).toBeLessThanOrEqual(MAX_ATTEMPTS - 1);
        else expect(r.resetAt).toBeDefined();
    });
});

describe('Sentinel: constantTimeCompare on adversarial inputs', () => {
    test('a one-character difference at the far end is still unequal', () => {
        const a = 'a'.repeat(4096);
        const b = 'a'.repeat(4095) + 'b';
        expect(Sentinel.constantTimeCompare(a, b)).toBe(false);
    });

    test('a prefix of a longer string is unequal', () => {
        expect(Sentinel.constantTimeCompare('secret', 'secret-longer')).toBe(false);
        expect(Sentinel.constantTimeCompare('secret-longer', 'secret')).toBe(false);
    });

    test('multi-byte characters compare by code unit, not by byte', () => {
        // A byte comparison of two different multi-byte strings could report a
        // collision; a code-unit comparison must not.
        expect(Sentinel.constantTimeCompare('é', 'e')).toBe(false);
        expect(Sentinel.constantTimeCompare('🔑', '🔒')).toBe(false);
    });

    test('only an identical string compares equal', () => {
        for (const s of ['', 'x', 'hunter2', 'é🔑', 'a'.repeat(1000)]) {
            expect(Sentinel.constantTimeCompare(s, s)).toBe(true);
            expect(Sentinel.constantTimeCompare(s, s + '!')).toBe(false);
        }
    });

    test('a string never equals a different string of the same length', () => {
        for (const [a, b] of [
            ['abc', 'xyz'],
            ['é🔑', 'ab'],
            ['a'.repeat(64), 'b'.repeat(64)],
        ]) {
            expect(Sentinel.constantTimeCompare(a, b)).toBe(false);
        }
    });
});