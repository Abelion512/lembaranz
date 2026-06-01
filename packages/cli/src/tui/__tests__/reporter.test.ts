import { test, expect, mock } from "bun:test";

const mockSpawn = mock(() => ({ unref: () => {} }));
mock.module("child_process", () => {
    return {
        spawn: mockSpawn
    };
});

import { openReport } from "../reporter.js";

test("openReport handles valid url", () => {
    mockSpawn.mockClear();
    expect(() => openReport("https://github.com/Abelion512/lembaranz/")).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    expect(mockSpawn.mock.calls[0][1]).toEqual(["https://github.com/Abelion512/lembaranz/"]);
});

test("openReport handles invalid url", () => {
    mockSpawn.mockClear();
    expect(() => openReport("not a valid url")).not.toThrow();
    expect(mockSpawn).not.toHaveBeenCalled();
});

test("openReport ignores non-http urls", () => {
    mockSpawn.mockClear();
    expect(() => openReport("file:///etc/passwd")).not.toThrow();
    expect(mockSpawn).not.toHaveBeenCalled();
});
