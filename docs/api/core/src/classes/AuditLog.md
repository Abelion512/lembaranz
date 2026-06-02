[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / AuditLog

# Class: AuditLog

Defined in: [packages/core/src/AuditLog.ts:8](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/AuditLog.ts#L8)

AuditLog (Privacy Report)
Records all Sentinel activity and AI processing for user transparency.
Decoupled from Node.js top-level imports to support browser builds.

## Constructors

### Constructor

> **new AuditLog**(): `AuditLog`

#### Returns

`AuditLog`

## Methods

### log()

> `static` **log**(`action`, `data`): `Promise`\<`void`\>

Defined in: [packages/core/src/AuditLog.ts:11](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/AuditLog.ts#L11)

#### Parameters

##### action

`string`

##### data

`unknown`

#### Returns

`Promise`\<`void`\>

***

### readLog()

> `static` **readLog**(): `Promise`\<`string`\>

Defined in: [packages/core/src/AuditLog.ts:39](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/AuditLog.ts#L39)

#### Returns

`Promise`\<`string`\>
