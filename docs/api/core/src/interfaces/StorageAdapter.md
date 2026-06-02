[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / StorageAdapter

# Interface: StorageAdapter

Defined in: [packages/core/src/storage/types.ts:24](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L24)

## Methods

### clear()

> **clear**(`store`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/types.ts:30](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L30)

#### Parameters

##### store

keyof [`LembaranzSchema`](LembaranzSchema.md)

#### Returns

`Promise`\<`void`\>

***

### count()

> **count**(`store`): `Promise`\<`number`\>

Defined in: [packages/core/src/storage/types.ts:29](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L29)

#### Parameters

##### store

keyof [`LembaranzSchema`](LembaranzSchema.md)

#### Returns

`Promise`\<`number`\>

***

### delete()

> **delete**(`store`, `key`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/types.ts:28](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L28)

#### Parameters

##### store

keyof [`LembaranzSchema`](LembaranzSchema.md)

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**\<`K`\>(`store`, `key`): `Promise`\<[`LembaranzSchema`](LembaranzSchema.md)\[`K`\]\[`"value"`\] \| `undefined`\>

Defined in: [packages/core/src/storage/types.ts:25](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L25)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](LembaranzSchema.md)

#### Parameters

##### store

`K`

##### key

`string`

#### Returns

`Promise`\<[`LembaranzSchema`](LembaranzSchema.md)\[`K`\]\[`"value"`\] \| `undefined`\>

***

### getAll()

> **getAll**\<`K`\>(`store`): `Promise`\<[`LembaranzSchema`](LembaranzSchema.md)\[`K`\]\[`"value"`\][]\>

Defined in: [packages/core/src/storage/types.ts:27](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L27)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](LembaranzSchema.md)

#### Parameters

##### store

`K`

#### Returns

`Promise`\<[`LembaranzSchema`](LembaranzSchema.md)\[`K`\]\[`"value"`\][]\>

***

### set()

> **set**\<`K`\>(`store`, `key`, `value`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/types.ts:26](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L26)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](LembaranzSchema.md)

#### Parameters

##### store

`K`

##### key

`string`

##### value

[`LembaranzSchema`](LembaranzSchema.md)\[`K`\]\[`"value"`\]

#### Returns

`Promise`\<`void`\>
