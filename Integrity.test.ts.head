import { describe, test, expect } from 'bun:test';
import { Integrity } from '../Integrity';

describe('Integrity', () => {
    describe('computeHash', () => {
        test('returns a 64-character hex string (SHA-256)', async () => {
            const data = { message: 'hello world' };
            const hash = await Integrity.computeHash(data);
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });

        test('produces the same hash for the same input', async () => {
            const data = { foo: 'bar', baz: 123 };
            const hash1 = await Integrity.computeHash(data);
            const hash2 = await Integrity.computeHash(data);
            expect(hash1).toBe(hash2);
        });

        test('excludes metadata fields: _hash, _timestamp, updatedAt', async () => {
            const baseData = { id: '1', content: 'test' };
            const dataWithMetadata = {
                ...baseData,
                _hash: 'some-old-hash',
                _timestamp: 123456789,
                updatedAt: '2023-01-01T00:00:00Z'
            };

            const hash1 = await Integrity.computeHash(baseData);
            const hash2 = await Integrity.computeHash(dataWithMetadata);

            expect(hash1).toBe(hash2);
        });

        test('is sensitive to other data changes', async () => {
            const hash1 = await Integrity.computeHash({ content: 'test' });
            const hash2 = await Integrity.computeHash({ content: 'test!' });
            expect(hash1).not.toBe(hash2);
        });

        test('handles nested objects and arrays', async () => {
            const data = {
                user: { id: 1, name: 'Alice', updatedAt: 'some-date' },
                tags: ['urgent', 'work'],
                metadata: {
                    _hash: 'ignore me'
                }
            };
            const dataSimplified = {
                user: { id: 1, name: 'Alice' },
                tags: ['urgent', 'work'],
                metadata: {}
            };
            const hash1 = await Integrity.computeHash(data);
            const hash2 = await Integrity.computeHash(dataSimplified);
            expect(hash1).toBe(hash2);
        });

        test('handles primitive values', async () => {
            const hashString = await Integrity.computeHash('just a string');
            const hashNumber = await Integrity.computeHash(42);
            const hashNull = await Integrity.computeHash(null);

            expect(hashString).toMatch(/^[0-9a-f]{64}$/);
            expect(hashNumber).toMatch(/^[0-9a-f]{64}$/);
            expect(hashNull).toMatch(/^[0-9a-f]{64}$/);
        });

        test('handles empty objects', async () => {
            const hash = await Integrity.computeHash({});
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });
    });
});
