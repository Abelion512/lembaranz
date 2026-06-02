[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Vault

# Class: Vault

Defined in: [packages/core/src/Vault.ts:7](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L7)

Vault: Lower-level cryptographic engine.
Wraps Web Crypto API for secure key management and encryption.

## Constructors

### Constructor

> **new Vault**(): `Vault`

#### Returns

`Vault`

## Methods

### base64ToBytes()

> `static` **base64ToBytes**(`base64`): `Uint8Array`

Defined in: [packages/core/src/Vault.ts:262](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L262)

Optimized base64 to Uint8Array conversion using an iterative loop.

#### Parameters

##### base64

`string`

#### Returns

`Uint8Array`

***

### bytesToHex()

> `static` **bytesToHex**(`bytes`): `string`

Defined in: [packages/core/src/Vault.ts:234](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L234)

Utility: Uint8Array to Hex string.

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`string`

***

### clearKey()

> `static` **clearKey**(): `void`

Defined in: [packages/core/src/Vault.ts:29](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L29)

Clears the active key and decryption cache from memory.

#### Returns

`void`

***

### decrypt()

> `static` **decrypt**(`ciphertext`, `iv`, `key?`): `Promise`\<`Result`\<`string`\>\>

Defined in: [packages/core/src/Vault.ts:120](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L120)

Standard AES-GCM 256 decryption.

#### Parameters

##### ciphertext

`ArrayBuffer`

##### iv

`Uint8Array`

##### key?

`CryptoKey`

#### Returns

`Promise`\<`Result`\<`string`\>\>

***

### decryptPacked()

> `static` **decryptPacked**(`packed`, `key?`): `Promise`\<`Result`\<`string`\>\>

Defined in: [packages/core/src/Vault.ts:166](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L166)

Decrypts from a packed "ivHex|base64Payload" string.

#### Parameters

##### packed

`string`

##### key?

`CryptoKey`

#### Returns

`Promise`\<`Result`\<`string`\>\>

***

### decryptPortable()

> `static` **decryptPortable**(`buffer`, `passwordBackup`): `Promise`\<`Result`\<`string`\>\>

Defined in: [packages/core/src/Vault.ts:303](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L303)

Portable decryption for backups.

#### Parameters

##### buffer

`Uint8Array`

##### passwordBackup

`string`

#### Returns

`Promise`\<`Result`\<`string`\>\>

***

### deriveKey()

> `static` **deriveKey**(`password`, `salt`): `Promise`\<`Result`\<`CryptoKey`\>\>

Defined in: [packages/core/src/Vault.ts:60](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L60)

Derives a cryptographic key from a plaintext password using Argon2id.

#### Parameters

##### password

`string`

##### salt

`Uint8Array`

#### Returns

`Promise`\<`Result`\<`CryptoKey`\>\>

***

### encrypt()

> `static` **encrypt**(`plaintext`, `key?`): `Promise`\<`Result`\<\{ `data`: `ArrayBuffer`; `iv`: `Uint8Array`; \}\>\>

Defined in: [packages/core/src/Vault.ts:96](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L96)

Standard AES-GCM 256 encryption.

#### Parameters

##### plaintext

`string`

##### key?

`CryptoKey`

#### Returns

`Promise`\<`Result`\<\{ `data`: `ArrayBuffer`; `iv`: `Uint8Array`; \}\>\>

***

### encryptPacked()

> `static` **encryptPacked**(`plaintext`, `key?`): `Promise`\<`Result`\<`string`\>\>

Defined in: [packages/core/src/Vault.ts:144](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L144)

Encrypts and returns a single pipe-separated string: "ivHex|base64Payload"

#### Parameters

##### plaintext

`string`

##### key?

`CryptoKey`

#### Returns

`Promise`\<`Result`\<`string`\>\>

***

### encryptPortable()

> `static` **encryptPortable**(`payload`, `passwordBackup`): `Promise`\<`Result`\<`Uint8Array`\<`ArrayBufferLike`\>\>\>

Defined in: [packages/core/src/Vault.ts:275](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L275)

Portable encryption: used for backups. 
Formats as: [LMBR (4 bytes)] [Salt (16 bytes)] [IV (12 bytes)] [Ciphertext]

#### Parameters

##### payload

`string`

##### passwordBackup

`string`

#### Returns

`Promise`\<`Result`\<`Uint8Array`\<`ArrayBufferLike`\>\>\>

***

### exportRawKey()

> `static` **exportRawKey**(`key`): `Promise`\<`Result`\<`ArrayBuffer`\>\>

Defined in: [packages/core/src/Vault.ts:204](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L204)

Exports a CryptoKey to raw bytes.

#### Parameters

##### key

`CryptoKey`

#### Returns

`Promise`\<`Result`\<`ArrayBuffer`\>\>

***

### generateMasterKey()

> `static` **generateMasterKey**(): `Promise`\<`Result`\<`CryptoKey`\>\>

Defined in: [packages/core/src/Vault.ts:44](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L44)

Generates a high-entropy 256-bit master key.

#### Returns

`Promise`\<`Result`\<`CryptoKey`\>\>

***

### getActiveKey()

> `static` **getActiveKey**(): `CryptoKey` \| `null`

Defined in: [packages/core/src/Vault.ts:22](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L22)

Returns the current session key.

#### Returns

`CryptoKey` \| `null`

***

### hexToBytes()

> `static` **hexToBytes**(`hex`): `Uint8Array`

Defined in: [packages/core/src/Vault.ts:243](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L243)

Optimized hex string to Uint8Array conversion using bitwise math.

#### Parameters

##### hex

`string`

#### Returns

`Uint8Array`

***

### importRawKey()

> `static` **importRawKey**(`raw`): `Promise`\<`Result`\<`CryptoKey`\>\>

Defined in: [packages/core/src/Vault.ts:216](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L216)

Imports raw bytes into a CryptoKey.

#### Parameters

##### raw

`ArrayBuffer`

#### Returns

`Promise`\<`Result`\<`CryptoKey`\>\>

***

### isLocked()

> `static` **isLocked**(): `boolean`

Defined in: [packages/core/src/Vault.ts:37](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L37)

Check if the vault is currently locked (no active key).

#### Returns

`boolean`

***

### setActiveKey()

> `static` **setActiveKey**(`key`): `void`

Defined in: [packages/core/src/Vault.ts:14](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Vault.ts#L14)

Sets the current session encryption key in memory.

#### Parameters

##### key

`CryptoKey`

#### Returns

`void`
