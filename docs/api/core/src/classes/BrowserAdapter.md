[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / BrowserAdapter

# Class: BrowserAdapter

Defined in: [packages/core/src/storage/BrowserAdapter.ts:7](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L7)

## Implements

- [`StorageAdapter`](../interfaces/StorageAdapter.md)

## Constructors

### Constructor

> **new BrowserAdapter**(): `BrowserAdapter`

#### Returns

`BrowserAdapter`

## Methods

### clear()

> **clear**(`store`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/BrowserAdapter.ts:64](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L64)

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

Defined in: [packages/core/src/storage/BrowserAdapter.ts:59](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L59)

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

Defined in: [packages/core/src/storage/BrowserAdapter.ts:54](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L54)

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

Defined in: [packages/core/src/storage/BrowserAdapter.ts:35](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L35)

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

> **getAll**\<`K`\>(`store`): `Promise`\<`any`[]\>

Defined in: [packages/core/src/storage/BrowserAdapter.ts:49](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L49)

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

#### Returns

`Promise`\<`any`[]\>

#### Implementation of

[`StorageAdapter`](../interfaces/StorageAdapter.md).[`getAll`](../interfaces/StorageAdapter.md#getall)

***

### set()

> **set**\<`K`\>(`store`, `key`, `value`): `Promise`\<`void`\>

Defined in: [packages/core/src/storage/BrowserAdapter.ts:40](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/BrowserAdapter.ts#L40)

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
