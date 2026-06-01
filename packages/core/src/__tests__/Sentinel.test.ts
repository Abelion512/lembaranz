import { describe, test, expect, beforeEach } from 'bun:test';
import { Sentinel } from '../Sentinel';

describe('Sentinel', () => {
    const TEST_KEY = 'test-vault-001';

    beforeEach(() => {
        Sentinel.clearAllRateLimits();
    });

    describe('constantTimeCompare', () => {
        test('returns true for identical strings', () => {
            expect(Sentinel.constantTimeCompare('abc', 'abc')).toBe(true);
        });

        test('returns false for different strings', () => {
            expect(Sentinel.constantTimeCompare('abc', 'abd')).toBe(false);
        });

        test('returns false for different length strings', () => {
            expect(Sentinel.constantTimeCompare('abc', 'abcd')).toBe(false);
        });

        test('handles empty strings', () => {
            expect(Sentinel.constantTimeCompare('', '')).toBe(true);
        });

        test('handles long strings', () => {
            const long = 'a'.repeat(1000);
            expect(Sentinel.constantTimeCompare(long, long)).toBe(true);
            expect(Sentinel.constantTimeCompare(long, long + 'x')).toBe(false);
        });
    });

    describe('checkRateLimit', () => {
        test('allows first attempt', () => {
            const result = Sentinel.checkRateLimit(TEST_KEY);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        test('tracks attempts within window', () => {
            Sentinel.checkRateLimit(TEST_KEY);
            const result = Sentinel.checkRateLimit(TEST_KEY);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(3);
        });

        test('allows up to 5 attempts then blocks on 6th', () => {
            // First 5 attempts should be allowed
            for (let i = 0; i < 5; i++) {
                const result = Sentinel.checkRateLimit(TEST_KEY);
                expect(result.allowed).toBe(true);
            }

            // 6th attempt should be blocked (lockout triggered)
            const result = Sentinel.checkRateLimit(TEST_KEY);
            expect(result.allowed).toBe(false);
            expect(result.resetAt).toBeDefined();
        });

        test('blocks subsequent attempts after lockout', () => {
            // Exhaust all 5 allowed attempts + 1 to trigger lockout
            for (let i = 0; i < 6; i++) {
                Sentinel.checkRateLimit(TEST_KEY);
            }

            const result = Sentinel.checkRateLimit(TEST_KEY);
            expect(result.allowed).toBe(false);
            expect(result.resetAt).toBeDefined();
            expect(result.resetAt!).toBeGreaterThan(Date.now());
        });

        test('different keys have independent limits', () => {
            Sentinel.checkRateLimit('key-a');
            Sentinel.checkRateLimit('key-a');

            const result = Sentinel.checkRateLimit('key-b');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        test('clearAllRateLimits removes all data', () => {
            Sentinel.checkRateLimit('key-1');
            Sentinel.checkRateLimit('key-2');

            Sentinel.clearAllRateLimits();

            expect(Sentinel.getStoreSize()).toBe(0);
        });
    });


    describe('resetRateLimit', () => {
        test('clears the limit for an existing key', () => {
            Sentinel.checkRateLimit(TEST_KEY);
            Sentinel.checkRateLimit(TEST_KEY);

            Sentinel.resetRateLimit(TEST_KEY);

            const result = Sentinel.checkRateLimit(TEST_KEY);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        test('removes the key from the internal store', () => {
            Sentinel.checkRateLimit(TEST_KEY);
            expect(Sentinel.getStoreSize()).toBe(1);

            Sentinel.resetRateLimit(TEST_KEY);
            expect(Sentinel.getStoreSize()).toBe(0);
        });

        test('does not throw when resetting a non-existent key', () => {
            expect(() => {
                Sentinel.resetRateLimit('non-existent-key');
            }).not.toThrow();
        });

        test('only removes the targeted key', () => {
            Sentinel.checkRateLimit('key-1');
            Sentinel.checkRateLimit('key-2');
            expect(Sentinel.getStoreSize()).toBe(2);

            Sentinel.resetRateLimit('key-1');

            expect(Sentinel.getStoreSize()).toBe(1);
            const result = Sentinel.checkRateLimit('key-2');
            expect(result.remaining).toBe(3); // one attempt was made, so 3 remaining (starts with 4)
        });
    });

    describe('memory leak prevention', () => {
        test('getStoreSize returns current count', () => {
            expect(Sentinel.getStoreSize()).toBe(0);

            Sentinel.checkRateLimit('a');
            Sentinel.checkRateLimit('b');
            Sentinel.checkRateLimit('c');

            expect(Sentinel.getStoreSize()).toBe(3);
        });
    });
});
