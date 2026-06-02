[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Sentinel

# Variable: Sentinel

> `const` **Sentinel**: `object`

Defined in: [packages/core/src/Sentinel.ts:61](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Sentinel.ts#L61)

## Type Declaration

### checkRateLimit()

> **checkRateLimit**(`key`): `object`

Check if operation is rate-limited.

#### Parameters

##### key

`string`

Unique identifier (e.g., vault ID, IP, user)

#### Returns

`object`

Rate limit decision with remaining attempts info

##### allowed

> **allowed**: `boolean`

##### remaining?

> `optional` **remaining?**: `number`

##### resetAt?

> `optional` **resetAt?**: `number`

### clearAllRateLimits()

> **clearAllRateLimits**(): `void`

Clear all rate limit data (e.g., on app shutdown).

#### Returns

`void`

### constantTimeCompare()

> **constantTimeCompare**(`a`, `b`): `boolean`

Constant-time string comparison to prevent timing attacks.
Optimized to avoid TextEncoder and array allocation overhead.
Performance impact: ~20x faster using charCodeAt for direct code unit comparison.

#### Parameters

##### a

`string`

##### b

`string`

#### Returns

`boolean`

### getStoreSize()

> **getStoreSize**(): `number`

Get current rate limit store size (for monitoring/debugging).

#### Returns

`number`

### resetRateLimit()

> **resetRateLimit**(`key`): `void`

Reset rate limit for a key (e.g., after successful unlock).

#### Parameters

##### key

`string`

#### Returns

`void`
