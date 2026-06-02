[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Storage

# Variable: Storage

> `const` **Storage**: `object`

Defined in: [packages/core/src/Storage.ts:23](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Storage.ts#L23)

## Type Declaration

### clear()

> **clear**(`store`): `Promise`\<`void`\>

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Returns

`Promise`\<`void`\>

### count()

> **count**(`store`): `Promise`\<`number`\>

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Returns

`Promise`\<`number`\>

### delete()

> **delete**(`store`, `key`): `Promise`\<`void`\>

#### Parameters

##### store

keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

##### key

`string`

#### Returns

`Promise`\<`void`\>

### get()

> **get**\<`K`\>(`store`, `key`): `Promise`\<[`LembaranzSchema`](../interfaces/LembaranzSchema.md)\[`K`\]\[`"value"`\] \| `undefined`\>

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

##### key

`string`

#### Returns

`Promise`\<[`LembaranzSchema`](../interfaces/LembaranzSchema.md)\[`K`\]\[`"value"`\] \| `undefined`\>

### getAll()

> **getAll**\<`K`\>(`store`): `Promise`\<[`LembaranzSchema`](../interfaces/LembaranzSchema.md)\[`K`\]\[`"value"`\][]\>

#### Type Parameters

##### K

`K` *extends* keyof [`LembaranzSchema`](../interfaces/LembaranzSchema.md)

#### Parameters

##### store

`K`

#### Returns

`Promise`\<[`LembaranzSchema`](../interfaces/LembaranzSchema.md)\[`K`\]\[`"value"`\][]\>

### initialize()

> **initialize**(`customPath?`): `Promise`\<`void`\>

#### Parameters

##### customPath?

`string`

#### Returns

`Promise`\<`void`\>

### set()

> **set**\<`K`\>(`store`, `key`, `value`): `Promise`\<`void`\>

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
