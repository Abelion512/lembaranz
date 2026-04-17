import { describe, expect, test } from 'bun:test';
import { formatRemainingUnlockAttempts, formatRetryMinutes } from './rateLimit';

describe('formatRetryMinutes', () => {
  test('returns 1 minute when resetAt is missing', () => {
    expect(formatRetryMinutes(undefined, 1000)).toBe(1);
  });

  test('returns 1 minute when resetAt has passed', () => {
    expect(formatRetryMinutes(1000, 2000)).toBe(1);
  });

  test('rounds up remaining minutes', () => {
    expect(formatRetryMinutes(61000, 0)).toBe(2);
  });
});

describe('formatRemainingUnlockAttempts', () => {
  test('returns locked when remaining attempts are unknown', () => {
    expect(formatRemainingUnlockAttempts(undefined)).toBe('locked');
  });

  test('returns remaining attempts text', () => {
    expect(formatRemainingUnlockAttempts(2)).toBe('2 attempt(s) left');
  });
});
