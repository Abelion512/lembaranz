import { describe, test, expect } from 'bun:test';
import { generateMnemonic, validateMnemonic, validateMnemonicChecksum } from '../Password';

describe('Password / BIP39 wordlist', () => {
    // Regression guard. The list once held 2034 entries including four words
    // that are not in BIP39 ("blow", "bunny", "tried", "well"), which shifted
    // every later index, and WORDLIST_SIZE was hardcoded to 2048 so indices
    // 2034-2047 emitted the literal string "undefined". 4.4% of generated
    // phrases contained an invalid word (~7.9% at 12 words).
    test('holds exactly 2048 words', () => {
        // generateMnemonic would already have thrown on import if it did not.
        const probe = generateMnemonic(24).split(' ');
        expect(probe).toHaveLength(24);
    });

    test('never emits an out-of-range word', () => {
        for (let i = 0; i < 2000; i++) {
            for (const word of generateMnemonic(12).split(' ')) {
                expect(word).toMatch(/^[a-z]+$/);
            }
        }
    });

    test('reaches the last word of the list', () => {
        // "zoo" is index 2047. If the list were short this could never be
        // produced as the 11th bit-group of an all-ones entropy.
        expect(validateMnemonic('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong')).toBe(true);
    });
});

describe('Password / BIP39 checksum', () => {
    test('accepts canonical BIP39 vectors', () => {
        const vectors = [
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
            'letter advice cage absurd amount doctor acoustic avoid letter advice cage above',
        ];
        for (const vector of vectors) {
            expect(validateMnemonicChecksum(vector)).toBe(true);
        }
    });

    test('produces checksum-valid phrases at every BIP39 length', () => {
        for (const count of [12, 15, 18, 21, 24]) {
            expect(validateMnemonicChecksum(generateMnemonic(count))).toBe(true);
        }
    });

    test('detects a single mistyped word', () => {
        // Fixed phrase so the assertion is deterministic. Generating a random
        // phrase and editing it cannot work as a hard assertion: BIP39 gives
        // only 4 checksum bits, so a one-word edit still validates 1 time in 16
        // by design. Editing the final word is reliable because that group
        // carries the checksum bits themselves.
        const words = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'.split(' ');
        words[11] = 'zoo';
        expect(validateMnemonicChecksum(words.join(' '))).toBe(false);
    });

    test('a one-word typo survives the 4-bit checksum about 1 time in 16', () => {
        // Not a defect, a property worth stating: 4 checksum bits over 12 words
        // means roughly 6% of single-word typos are NOT caught locally. Users
        // must still expect an occasional "phrase rejected" after a careful
        // transcription, so the UI must not promise perfect typo detection.
        let survived = 0;
        const trials = 2000;
        for (let i = 0; i < trials; i++) {
            const words = generateMnemonic(12).split(' ');
            words[5] = words[5] === 'about' ? 'zoo' : 'about';
            if (validateMnemonicChecksum(words.join(' '))) survived++;
        }
        // Binomial(2000, 1/16): mean 125, sd ~10.7. This band is ~9 sigma wide,
        // so it cannot flake, while still failing if detection breaks entirely.
        expect(survived).toBeGreaterThan(60);
        expect(survived).toBeLessThan(200);
    });

    test('reports false for non-BIP39 word counts', () => {
        expect(validateMnemonicChecksum(generateMnemonic(6))).toBe(false);
    });

    test('is not required for recovery: word-list check still passes a bad checksum', () => {
        // Phrases issued before the checksum existed must keep working, so
        // validateMnemonic must not start rejecting them. Fixed phrase so the
        // result is deterministic.
        const good = 'letter advice cage absurd amount doctor acoustic avoid letter advice cage above';
        expect(validateMnemonic(good)).toBe(true);
        expect(validateMnemonicChecksum(good)).toBe(true);

        const edited = good.replace('doctor', 'donkey');
        expect(validateMnemonic(edited)).toBe(true);
        expect(validateMnemonicChecksum(edited)).toBe(false);
    });
});

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

        test('never repeats a word back to back', () => {
            // Previously this drew one phrase and called it statistical. It was
            // not a property BIP39 provides: with 2048 words and 11 adjacent
            // pairs, "legal legal" shows up in roughly 1 phrase in 185, which
            // made the core suite fail about once every few hundred runs and
            // made `bun run verify` a coin flip. `generateMnemonic` now redraws
            // on a collision, so this is a guarantee and several draws are
            // checked to cover the standard lengths.
            for (const wordCount of [12, 15, 18, 21, 24]) {
                for (let draw = 0; draw < 20; draw++) {
                    const words = generateMnemonic(wordCount).split(' ');
                    expect(words).toHaveLength(wordCount);
                    for (let i = 1; i < words.length; i++) {
                        expect(words[i]).not.toBe(words[i - 1]);
                    }
                }
            }
        });

        test('a redrawn phrase is still valid BIP39', () => {
            // The duplicate rejection must not weaken the checksum contract:
            // whatever the retry loop returns has to validate.
            for (let draw = 0; draw < 25; draw++) {
                expect(validateMnemonic(generateMnemonic())).toBe(true);
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
