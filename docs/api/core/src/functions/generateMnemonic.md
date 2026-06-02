[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / generateMnemonic

# Function: generateMnemonic()

> **generateMnemonic**(`wordCount?`): `string`

Defined in: [packages/core/src/Password.ts:2057](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Password.ts#L2057)

Generates a BIP39-style mnemonic phrase.
Uses modulo-biased selection from the full 2048-word list.
For production-grade cryptographic mnemonics, consider using
a library like `bip39` with proper checksum validation.

## Parameters

### wordCount?

`number` = `12`

Number of words (default: 12, provides ~132 bits of entropy)

## Returns

`string`

Space-separated mnemonic string
