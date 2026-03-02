import { expect, test, describe } from "bun:test";
import { Sentinel } from "../src/Sentinel";
import { Brankas } from "../src/Brankas";

describe("Sentinel Autonomous Defense", () => {
    test("Auto-Lock on Integrity Violation", async () => {
        const salt = new Uint8Array(16);
        const key = await Brankas.deriveKey("test", salt);
        Brankas.setActiveKey(key);
        expect(Brankas.isLocked()).toBe(false);

        await Sentinel.laporkan('INTEGRITY_VIOLATION', 'Test auto-lock');
        expect(Brankas.isLocked()).toBe(true);
    });
});
