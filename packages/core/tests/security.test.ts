import { expect, test, describe } from "bun:test";
import { Integritas } from "../src/Integritas";
import { Brankas } from "../src/Brankas";

describe("Audit Keamanan Core", () => {
    test("Integritas: Hash harus berubah jika updatedAt berubah", async () => {
        const note = { title: "Test", content: "Isi", updatedAt: "2024-01-01" };
        const h1 = await Integritas.hitungHash(note);

        const note2 = { ...note, updatedAt: "2024-01-02" };
        const h2 = await Integritas.hitungHash(note2);

        expect(h1).not.toBe(h2);
    });

    test("Brankas: Enkripsi GCM harus menghasilkan IV unik setiap saat", async () => {
        // Mocking Brankas active key for test
        const salt = new Uint8Array(16);
        const key = await Brankas.deriveKey("password", salt);
        Brankas.setActiveKey(key);

        const enc1 = await Brankas.encryptPacked("Data");
        const enc2 = await Brankas.encryptPacked("Data");

        const iv1 = enc1.split('|')[0];
        const iv2 = enc2.split('|')[0];

        expect(iv1).not.toBe(iv2);
    });
});
