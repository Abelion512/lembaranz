import { describe, test, expect } from 'bun:test';
import { Integrity } from '../Integrity';

describe('Integrity', () => {
    describe('computeHash', () => {
        test('should compute valid SHA-256 hash', async () => {
            const data = { test: true };
            const hash = await Integrity.computeHash(data);

            expect(typeof hash).toBe('string');
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[0-9a-f]+$/);

            // Known hash for {"test":true}
            // echo -n '{"test":true}' | sha256sum
            expect(hash).toBe('6fd977db9b2afe87a9ceee48432881299a6aaf83d935fbbe83007660287f9c2e');
        });

        test('should ignore metadata fields', async () => {
            const baseData = { test: true };
            const dataWithMeta = {
                test: true,
                _hash: '123',
                _timestamp: 456,
                updatedAt: 'now'
            };

            const hash1 = await Integrity.computeHash(baseData);
            const hash2 = await Integrity.computeHash(dataWithMeta);

            expect(hash1).toBe(hash2);
        });

        test('should handle nested objects', async () => {
            const data1 = { a: { b: 1 }, c: [1, 2, 3] };
            const data2 = { a: { b: 1 }, c: [1, 2, 3] };
            const data3 = { a: { b: 2 }, c: [1, 2, 3] };

            const hash1 = await Integrity.computeHash(data1);
            const hash2 = await Integrity.computeHash(data2);
            const hash3 = await Integrity.computeHash(data3);

            expect(hash1).toBe(hash2);
            expect(hash1).not.toBe(hash3);
        });
    });
});
