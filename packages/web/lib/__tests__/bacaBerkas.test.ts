import { expect, test, describe } from "bun:test";
import { bacaBerkas } from "../bacaBerkas";

describe("bacaBerkas Security", () => {
    test("harus menolak akses di luar folder docs", () => {
        const content = bacaBerkas("package.json");
        expect(content).toBeNull();
    });

    test("harus menolak path traversal", () => {
        const content = bacaBerkas("docs/../../package.json");
        expect(content).toBeNull();
    });

    test("harus membaca berkas yang diizinkan (docs/id/cli.md)", () => {
        const content = bacaBerkas("docs/id/cli.md");
        expect(content).not.toBeNull();
        expect(content).toContain("Lembaran CLI");
    });
});
