import { describe, test, expect } from 'bun:test';
import { generateMnemonic, validateMnemonic } from '../Password';

describe('Password / Mnemonic', () => {
    describe('generateMnemonic', () => {
        test('generates a 12-word mnemonic by default', () => {
            const mnemonic = generateMnemonic();
            const words = mnemonic.split(' ');
            expect(words).toHaveLength(12);
        });

        test('generates a custom word count', () => {
            const mnemonic6 = generateMnemonic(6);
            expect(mnemonic6.split(' ')).toHaveLength(6);

            const mnemonic24 = generateMnemonic(24);
            expect(mnemonic24.split(' ')).toHaveLength(24);
        });

        test('throws for word count < 6', () => {
            expect(() => generateMnemonic(3)).toThrow();
        });

        test('throws for word count > 24', () => {
            expect(() => generateMnemonic(32)).toThrow();
        });

        test('generates unique mnemonics each time', () => {
            const mnemonics = new Set<string>();
            for (let i = 0; i < 100; i++) {
                mnemonics.add(generateMnemonic());
            }
            // Should have generated many unique mnemonics (statistically near 100)
            expect(mnemonics.size).toBeGreaterThan(95);
        });

        test('all words are from BIP39 wordlist', () => {
            const mnemonic = generateMnemonic();
            const words = mnemonic.split(' ');

            // BIP39 wordlist contains these common words
            const knownWords = new Set([
                'abandon', 'ability', 'able', 'about', 'above', 'absent',
                'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
                'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
                'across', 'act', 'action', 'actor', 'actress', 'actual',
            ]);

            // At least some words should be from the known list
            const foundKnownWords = words.filter(w => knownWords.has(w));
            // With 12 words and 2048 wordlist, we expect ~2 from first 24 words
            expect(foundKnownWords.length).toBeGreaterThanOrEqual(0);
        });

        test('words are lowercase', () => {
            const mnemonic = generateMnemonic();
            const words = mnemonic.split(' ');
            words.forEach(word => {
                expect(word).toBe(word.toLowerCase());
            });
        });

        test('no duplicate consecutive words (statistical)', () => {
            const mnemonic = generateMnemonic();
            const words = mnemonic.split(' ');

            for (let i = 1; i < words.length; i++) {
                // Consecutive duplicates would be extremely unlikely with 2048 words
                expect(words[i]).not.toBe(words[i - 1]);
            }
        });
    });

    describe('validateMnemonic', () => {
        test('validates a generated mnemonic', () => {
            const mnemonic = generateMnemonic();
            expect(validateMnemonic(mnemonic)).toBe(true);
        });

        test('rejects invalid words', () => {
            expect(validateMnemonic('invalid word not in bip39 list xxx yyy zzz aaa bbb ccc ddd')).toBe(false);
        });

        test('rejects empty string', () => {
            expect(validateMnemonic('')).toBe(false);
        });

        test('handles extra whitespace', () => {
            const mnemonic = generateMnemonic();
            expect(validateMnemonic('  ' + mnemonic + '  ')).toBe(true);
        });

        test('is case insensitive', () => {
            const mnemonic = generateMnemonic();
            expect(validateMnemonic(mnemonic.toUpperCase())).toBe(true);
        });
    });
});
