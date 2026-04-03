import { expect, test, describe } from "bun:test";
import { Integritas } from "../Integritas";

describe("Integritas Module", () => {
    describe("hitungHash", () => {
        test("harus menghasilkan hash yang konsisten untuk data yang sama", async () => {
            const data = { pesan: "Halo Dunia", angka: 42 };
            const hash1 = await Integritas.hitungHash(data);
            const hash2 = await Integritas.hitungHash(data);

            expect(hash1).toBe(hash2);
            expect(hash1.length).toBe(64); // SHA-256 hex string length
        });

        test("harus mengabaikan field metadata (_hash, _timestamp, updatedAt)", async () => {
            const dataDasar = { id: "123", konten: "Catatan rahasia" };
            const dataDenganMetadata = {
                ...dataDasar,
                _hash: "hash-lama",
                _timestamp: Date.now(),
                updatedAt: new Date().toISOString()
            };

            const hash1 = await Integritas.hitungHash(dataDasar);
            const hash2 = await Integritas.hitungHash(dataDenganMetadata);

            expect(hash1).toBe(hash2);
        });

        test("harus menghasilkan hash yang berbeda untuk data yang berbeda", async () => {
            const data1 = { id: "1", teks: "A" };
            const data2 = { id: "1", teks: "B" };

            const hash1 = await Integritas.hitungHash(data1);
            const hash2 = await Integritas.hitungHash(data2);

            expect(hash1).not.toBe(hash2);
        });

        test("harus menangani data null dan tipe dasar", async () => {
            const hashNull = await Integritas.hitungHash(null);
            const hashString = await Integritas.hitungHash("test");
            const hashAngka = await Integritas.hitungHash(123);

            expect(hashNull.length).toBe(64);
            expect(hashString.length).toBe(64);
            expect(hashAngka.length).toBe(64);
            expect(hashNull).not.toBe(hashString);
        });

        test("harus menangani objek bersarang (nested objects)", async () => {
            const data = {
                id: "1",
                meta: {
                    author: "Jules",
                    tags: ["test", "dev"]
                }
            };
            const hash1 = await Integritas.hitungHash(data);

            const dataLain = { ...data, meta: { ...data.meta, author: "Abelion" } };
            const hash2 = await Integritas.hitungHash(dataLain);

            expect(hash1).not.toBe(hash2);
        });

        test("harus menangani array dengan benar", async () => {
             const hash1 = await Integritas.hitungHash([1, 2, 3]);
             const hash2 = await Integritas.hitungHash([1, 2, 3]);
             const hash3 = await Integritas.hitungHash([3, 2, 1]);

             expect(hash1).toBe(hash2);
             expect(hash1).not.toBe(hash3);
        });
    });
});
