import { expect, test, describe } from "bun:test";
import { ambilKontenDok } from "../ambilKontenDok";

describe("ambilKontenDok", () => {
    test("harus mengambil dokumen valid", async () => {
        const content = await ambilKontenDok("cli", "id");
        expect(content).not.toBeNull();
    });

    test("harus menolak path traversal", async () => {
        const content = await ambilKontenDok("../../package.json", "id");
        expect(content).toBeNull();
    });

    test("harus fallback en -> id", async () => {
        // Asumsi dokumen 'performa' ada di id tapi mungkin belum di en
        const content = await ambilKontenDok("performa", "en");
        expect(content).not.toBeNull();
    });

    test("harus menolak slug kosong", async () => {
        const content = await ambilKontenDok("", "id");
        expect(content).toBeNull();
    });

    test("harus menolak perubahan ekstrem (anti-evasion)", async () => {
        const content = await ambilKontenDok("abc!!!!!!!!", "id");
        expect(content).toBeNull();
    });
});
