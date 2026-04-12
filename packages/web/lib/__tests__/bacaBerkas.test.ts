import { expect, test, describe } from "bun:test";
import { readFile } from "../readFile";

describe("readFile Security", () => {
    test("harus menolak akses di luar folder docs", () => {
        const content = readFile("package.json");
        expect(content).toBeNull();
    });

    test("harus menolak path traversal", () => {
        const content = readFile("docs/../../package.json");
        expect(content).toBeNull();
    });

    test("harus membaca berkas yang diizinkan (docs/id/cli.md)", () => {
        const content = readFile("docs/id/cli.md");
        expect(content).not.toBeNull();
        expect(content).toContain("Lembaran CLI");
    });
});
