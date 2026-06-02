[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / RateLimitState

# Interface: RateLimitState

Defined in: [packages/core/src/Sentinel.ts:7](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Sentinel.ts#L7)

Sentinel: Security hardening module
Rate limiting, constant-time comparison, brute-force protection,
and automatic expired-entry cleanup to prevent memory leaks.

## Properties

### attempts

> **attempts**: `number`

Defined in: [packages/core/src/Sentinel.ts:8](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Sentinel.ts#L8)

***

### lastAttempt

> **lastAttempt**: `number`

Defined in: [packages/core/src/Sentinel.ts:9](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Sentinel.ts#L9)

***

### lockoutUntil?

> `optional` **lockoutUntil?**: `number`

Defined in: [packages/core/src/Sentinel.ts:10](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Sentinel.ts#L10)
