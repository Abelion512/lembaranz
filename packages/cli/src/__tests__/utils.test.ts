import { beforeEach, describe, expect, mock, test } from 'bun:test';

const promptsMock = mock(async () => ({ pw: 'rahasia' }));
const unlockVaultMock = mock(async () => ({ data: false }));
const checkRateLimitMock = mock(() => ({ allowed: true, remaining: 4 }));
const resetRateLimitMock = mock(() => {});

mock.module('prompts', () => ({
  default: promptsMock
}));

mock.module('@lembaranz/core', () => ({
  Context: {
    detectContextAuto: mock(async () => 'saku'),
    resolvePath: mock(async () => '/tmp/lembaranz')
  },
  Storage: {
    initialize: mock(async () => {})
  },
  Archive: {
    unlockVault: unlockVaultMock
  },
  Sentinel: {
    checkRateLimit: checkRateLimitMock,
    resetRateLimit: resetRateLimitMock
  }
}));

const { openVaultCLI } = await import('../utils');

describe('openVaultCLI rate-limit reset behavior', () => {
  const consoleLogSpy = mock(() => {});

  beforeEach(() => {
    promptsMock.mockReset();
    unlockVaultMock.mockReset();
    checkRateLimitMock.mockReset();
    resetRateLimitMock.mockReset();
    consoleLogSpy.mockReset();

    promptsMock.mockResolvedValue({ pw: 'rahasia' });
    checkRateLimitMock.mockReturnValue({ allowed: true, remaining: 4 });

    console.log = consoleLogSpy as typeof console.log;
  });

  test('wrong password does not reset attempts', async () => {
    unlockVaultMock.mockResolvedValue({
      data: false,
      error: null
    });

    const result = await openVaultCLI();

    expect(result).toBe(false);
    expect(resetRateLimitMock).toHaveBeenCalledTimes(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Failed to open vault: Authentication failed.');
  });

  test('correct password resets attempts', async () => {
    unlockVaultMock.mockResolvedValue({
      data: true,
      error: null
    });

    const result = await openVaultCLI();

    expect(result).toBe(true);
    expect(resetRateLimitMock).toHaveBeenCalledTimes(1);
    expect(resetRateLimitMock).toHaveBeenCalledWith('vault-unlock');
  });
});
