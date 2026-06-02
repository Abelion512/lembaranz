[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / LembaranzSchema

# Interface: LembaranzSchema

Defined in: [packages/core/src/storage/types.ts:4](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L4)

## Extends

- `DBSchema`

## Indexable

> \[`s`: `string`\]: `DBSchemaValue`

## Properties

### folders

> **folders**: `object`

Defined in: [packages/core/src/storage/types.ts:10](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L10)

#### key

> **key**: `string`

#### value

> **value**: [`Folder`](Folder.md)

***

### kv

> **kv**: `object`

Defined in: [packages/core/src/storage/types.ts:14](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L14)

#### key

> **key**: `string`

#### value

> **value**: `unknown`

***

### meta

> **meta**: `object`

Defined in: [packages/core/src/storage/types.ts:18](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L18)

#### key

> **key**: `string`

#### value

> **value**: `unknown`

***

### notes

> **notes**: `object`

Defined in: [packages/core/src/storage/types.ts:5](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/storage/types.ts#L5)

#### indexes

> **indexes**: `object`

##### indexes.folderId

> **folderId**: `string`

##### indexes.updatedAt

> **updatedAt**: `string`

#### key

> **key**: `string`

#### value

> **value**: [`Note`](../type-aliases/Note.md)
