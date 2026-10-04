import { beforeEach, describe, expect, mock, test } from "bun:test";

const promptsMock = mock(async (): Promise<{ pw?: string }> => ({ pw: "rahasia" }));
type UnlockResult = { data: boolean | null; error: Error | null };
const unlockVaultMock = mock(async (): Promise<UnlockResult> => ({ data: false, error: null }));

mock.module("prompts", () => ({
  default: promptsMock,
}));

mock.module("@lembaranz/core", () => ({
  Context: {
    detectContextAuto: mock(async () => "saku"),
    resolvePath: mock(async () => "/tmp/lembaranz"),
  },
  Storage: {
    initialize: mock(async () => {}),
  },
  Archive: {
    unlockVault: unlockVaultMock,
  },
}));

const { openVaultCLI } = await import("../utils");

/**
 * Rate limiting moved into `Archive.unlockVault` so every caller is covered,
 * not just the CLI. While the check lived here, `lembaranz server` (which calls
 * unlockVault directly) was an unthrottled password oracle. These tests
 * therefore cover only what is still the CLI's job: delegating and surfacing
 * the result. The throttling itself is tested in core, next to the code.
 */
describe("openVaultCLI delegation", () => {
  const consoleLogSpy = mock(() => {});

  beforeEach(() => {
    promptsMock.mockReset();
    unlockVaultMock.mockReset();
    consoleLogSpy.mockReset();

    promptsMock.mockResolvedValue({ pw: "rahasia" });
    console.log = consoleLogSpy as typeof console.log;
  });

  test("a cancelled prompt does not attempt to unlock", async () => {
    promptsMock.mockResolvedValue({});

    expect(await openVaultCLI()).toBe(false);
    expect(unlockVaultMock).toHaveBeenCalledTimes(0);
  });

  test("a wrong password is reported and denied", async () => {
    unlockVaultMock.mockResolvedValue({ data: false, error: null });

    expect(await openVaultCLI()).toBe(false);
    expect(unlockVaultMock).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Failed to open vault: Authentication failed."
    );
  });

  test("a correct password unlocks", async () => {
    unlockVaultMock.mockResolvedValue({ data: true, error: null });

    expect(await openVaultCLI()).toBe(true);
  });

  test("a rate-limit refusal from unlockVault is surfaced verbatim", async () => {
    unlockVaultMock.mockResolvedValue({
      data: null,
      error: new Error("Too many failed attempts. Try again later."),
    });

    expect(await openVaultCLI()).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Failed to open vault: Too many failed attempts. Try again later."
    );
  });
});