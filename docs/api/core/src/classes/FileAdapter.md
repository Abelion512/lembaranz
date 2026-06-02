[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / FileAdapter

# Class: FileAdapter

Defined in: [packages/core/src/storage/FileAdapter.ts:14](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L14)

## Implements

- [`StorageAdapter`](../interfaces/StorageAdapter.md)

## Constructors

### Constructor

> **new FileAdapter**(`customPath?`): `FileAdapter`

Defined in: [packages/core/src/storage/FileAdapter.ts:20](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L20)

#### Parameters

##### customPath?

`string`

#### Returns

`FileAdapter`

## Methods

### clear()

> **clear**(`store`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/FileAdapter.ts:185](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L185)

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`clear`](../interfaces/StorageAdapter.md#clear)

***

### count()

> **count**(`store`): `Promise`\<`number`\>

Defined in: [packages/core/src/storage/FileAdapter.ts:179](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L179)

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`count`](../interfaces/StorageAdapter.md#count)

***

### delete()

> **delete**(`store`, `key`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/FileAdapter.ts:172](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L172)

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

##### key

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`delete`](../interfaces/StorageAdapter.md#delete)

***

### get()

> **get**\<`K`\>(`store`, `key`): `Promise`\<`any`\>

Defined in: [packages/core/src/storage/FileAdapter.ts:135](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L135)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

##### key

`string`

#### Returns

`Promise`\<`any`\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`get`](../interfaces/StorageAdapter.md#get)

***

### getAll()

> **getAll**\<`K`\>(`store`): `Promise`\<`unknown`[]\>

Defined in: [packages/core/src/storage/FileAdapter.ts:166](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L166)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

#### Returns

`Promise`\<`unknown`[]\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`getAll`](../interfaces/StorageAdapter.md#getall)

***

### set()

> **set**\<`K`\>(`store`, `key`, `value`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/FileAdapter.ts:141](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/FileAdapter.ts#L141)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

##### key

`string`

##### value

[`LembaranzSchema`](../interfaces/LembaranzSchema.md)\[`K`\]\[`"value"`\]

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`set`](../interfaces/StorageAdapter.md#set)
