import { expect, test, describe } from "bun:test";
import { getDocContent } from "../getDocContent";

describe("getDocContent", () => {
    test("harus mengambil dokumen valid", async () => {
        const content = await getDocContent("cli", "id");
        expect(content).not.toBeNull();
    });

    test("harus menolak path traversal", async () => {
        const content = await getDocContent("../../package.json", "id");
        expect(content).toBeNull();
    });

    test("harus fallback en -> id", async () => {
        // Asumsi dokumen 'performa' ada di id tapi mungkin belum di en
        const content = await getDocContent("performa", "en");
        expect(content).not.toBeNull();
    });

    test("harus menolak slug kosong", async () => {
        const content = await getDocContent("", "id");
        expect(content).toBeNull();
    });

    test("harus menolak perubahan ekstrem (anti-evasion)", async () => {
        const content = await getDocContent("abc!!!!!!!!", "id");
        expect(content).toBeNull();
    });
});
