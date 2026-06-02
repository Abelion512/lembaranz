[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Integrity

# Variable: Integrity

> `const` **Integrity**: `object`

Defined in: [packages/core/src/Integrity.ts:9](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Integrity.ts#L9)

## Type Declaration

### computeHash()

> **computeHash**(`data`): `Promise`\<`string`\>

Calculates a SHA-256 hash of an object for integrity verification.
Metadata fields are stripped before calculation using a replacer function.
This is more efficient than cloning and deleting keys.

#### Parameters

##### data

`unknown`

#### Returns

`Promise`\<`string`\>
