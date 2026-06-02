[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / DecryptedNote

# Interface: DecryptedNote

Defined in: [packages/core/src/Formula.ts:31](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L31)

Note after decryption (credentials are parsed)

## Extends

- `Omit`\<[`StoredNote`](StoredNote.md), `"credentials"`\>

## Properties

### \_hash?

> `optional` **\_hash?**: `string`

Defined in: [packages/core/src/Formula.ts:18](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L18)

#### Inherited from

[`StoredNote`](StoredNote.md).[`_hash`](StoredNote.md#_hash)

***

### \_timestamp?

> `optional` **\_timestamp?**: `string`

Defined in: [packages/core/src/Formula.ts:19](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L19)

#### Inherited from

[`StoredNote`](StoredNote.md).[`_timestamp`](StoredNote.md#_timestamp)

***

### content

> **content**: `string`

Defined in: [packages/core/src/Formula.ts:37](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L37)

Plaintext content after decryption

#### Overrides

[`StoredNote`](StoredNote.md).[`content`](StoredNote.md#content)

***

### createdAt

> **createdAt**: `string`

Defined in: [packages/core/src/Formula.ts:13](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L13)

#### Inherited from

[`StoredNote`](StoredNote.md).[`createdAt`](StoredNote.md#createdat)

***

### credentials?

> `optional` **credentials?**: `string` \| [`CredentialsData`](CredentialsData.md)

Defined in: [packages/core/src/Formula.ts:33](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L33)

Decrypted credentials object or undefined

***

### folderId

> **folderId**: `string` \| `null`

Defined in: [packages/core/src/Formula.ts:9](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L9)

#### Inherited from

[`StoredNote`](StoredNote.md).[`folderId`](StoredNote.md#folderid)

***

### id

> **id**: `string`

Defined in: [packages/core/src/Formula.ts:5](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L5)

#### Inherited from

[`StoredNote`](StoredNote.md).[`id`](StoredNote.md#id)

***

### isCredentials?

> `optional` **isCredentials?**: `boolean`

Defined in: [packages/core/src/Formula.ts:15](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L15)

#### Inherited from

[`StoredNote`](StoredNote.md).[`isCredentials`](StoredNote.md#iscredentials)

***

### isFavorite

> **isFavorite**: `boolean`

Defined in: [packages/core/src/Formula.ts:11](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L11)

#### Inherited from

[`StoredNote`](StoredNote.md).[`isFavorite`](StoredNote.md#isfavorite)

***

### isPinned

> **isPinned**: `boolean`

Defined in: [packages/core/src/Formula.ts:10](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L10)

#### Inherited from

[`StoredNote`](StoredNote.md).[`isPinned`](StoredNote.md#ispinned)

***

### preview?

> `optional` **preview?**: `string`

Defined in: [packages/core/src/Formula.ts:8](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L8)

#### Inherited from

[`StoredNote`](StoredNote.md).[`preview`](StoredNote.md#preview)

***

### syncStatus?

> `optional` **syncStatus?**: `"synced"` \| `"pending"` \| `"error"`

Defined in: [packages/core/src/Formula.ts:20](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L20)

#### Inherited from

[`StoredNote`](StoredNote.md).[`syncStatus`](StoredNote.md#syncstatus)

***

### tags

> **tags**: `string`[]

Defined in: [packages/core/src/Formula.ts:12](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L12)

#### Inherited from

[`StoredNote`](StoredNote.md).[`tags`](StoredNote.md#tags)

***

### title

> **title**: `string`

Defined in: [packages/core/src/Formula.ts:35](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L35)

Plaintext title after decryption

#### Overrides

[`StoredNote`](StoredNote.md).[`title`](StoredNote.md#title)

***

### updatedAt

> **updatedAt**: `string`

Defined in: [packages/core/src/Formula.ts:14](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Formula.ts#L14)

#### Inherited from

[`StoredNote`](StoredNote.md).[`updatedAt`](StoredNote.md#updatedat)
