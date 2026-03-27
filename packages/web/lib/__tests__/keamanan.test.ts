import { expect, test, describe } from "bun:test";
import { ambilKontenDok, ambilMetadataBantuan } from "../ambilKontenDok";

describe("Security: Language Parameter Validation", () => {
    describe("ambilKontenDok", () => {
        test("should not allow reading PRIVACY.md via lang traversal", async () => {
            // @ts-ignore
            const content = await ambilKontenDok("PRIVACY", "../../public");
            expect(content).toBeNull();
        });

        test("should only allow 'id' or 'en' as lang", async () => {
            // @ts-ignore
            expect(await ambilKontenDok("cli", "nonexistent")).toBeNull();
            expect(await ambilKontenDok("cli", "id")).not.toBeNull();
            expect(await ambilKontenDok("cli", "en")).not.toBeNull();
        });
    });

    describe("ambilMetadataBantuan", () => {
        test("should fallback to 'id' for invalid lang", async () => {
            // @ts-ignore
            const meta = await ambilMetadataBantuan("invalid");
            expect(meta).toBeDefined();
            // Should be same as 'id'
            const metaId = await ambilMetadataBantuan("id");
            expect(meta).toEqual(metaId);
        });
    });
});
