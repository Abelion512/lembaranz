[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Context

# Class: Context

Defined in: [packages/core/src/Context.ts:9](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Context.ts#L9)

Context: Context and Path Resolver.
Standardizes directory and file naming for personal and project vaults.

## Constructors

### Constructor

> **new Context**(): `Context`

#### Returns

`Context`

## Methods

### detectContextAuto()

> `static` **detectContextAuto**(): `Promise`\<[`VaultContext`](../type-aliases/VaultContext.md)\>

Defined in: [packages/core/src/Context.ts:119](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Context.ts#L119)

Smart context detection. Returns 'project' if local configuration exists.

#### Returns

`Promise`\<[`VaultContext`](../type-aliases/VaultContext.md)\>

***

### readEnv()

> `static` **readEnv**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [packages/core/src/Context.ts:141](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Context.ts#L141)

Reads local .env file.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

***

### resolvePath()

> `static` **resolvePath**(`context`): `Promise`\<`string`\>

Defined in: [packages/core/src/Context.ts:31](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Context.ts#L31)

Resolves the absolute path for the given context.
Includes automatic migration from legacy naming.

#### Parameters

##### context

[`VaultContext`](../type-aliases/VaultContext.md)

#### Returns

`Promise`\<`string`\>

***

### writeEnv()

> `static` **writeEnv**(`key`, `value`): `Promise`\<`Result`\<`boolean`\>\>

Defined in: [packages/core/src/Context.ts:179](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Context.ts#L179)

Writes or updates a local .env variable.

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`Promise`\<`Result`\<`boolean`\>\>
