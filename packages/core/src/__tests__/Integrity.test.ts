import { describe, test, expect } from "bun:test";
import { Integrity } from "../Integrity";

describe("Integrity Module", () => {
  describe("computeHash", () => {
    test("should compute valid SHA-256 hash", async () => {
      const data = { test: true };
      const hash = await Integrity.computeHash(data);

      expect(typeof hash).toBe("string");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);

      // Known hash for {"test":true}
      // echo -n '{"test":true}' | sha256sum
      expect(hash).toBe(
        "6fd977db9b2afe87a9ceee48432881299a6aaf83d935fbbe83007660287f9c2e"
      );
    });

    test("returns a 64-character hex string (SHA-256)", async () => {
      const data = { message: "hello world" };
      const hash = await Integrity.computeHash(data);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test("produces the same hash for the same input", async () => {
      const data = { foo: "bar", baz: 123 };
      const hash1 = await Integrity.computeHash(data);
      const hash2 = await Integrity.computeHash(data);
      expect(hash1).toBe(hash2);
    });

    test("should ignore metadata fields", async () => {
      const baseData = { test: true };
      const dataWithMeta = {
        test: true,
        _hash: "123",
        _timestamp: 456,
        updatedAt: "now",
      };

      const hash1 = await Integrity.computeHash(baseData);
      const hash2 = await Integrity.computeHash(dataWithMeta);

      expect(hash1).toBe(hash2);
    });

    test("excludes metadata fields: _hash, _timestamp, updatedAt", async () => {
      const baseData = { id: "1", content: "test" };
      const dataWithMetadata = {
        ...baseData,
        _hash: "some-old-hash",
        _timestamp: 123456789,
        updatedAt: "2023-01-01T00:00:00Z",
      };

      const hash1 = await Integrity.computeHash(baseData);
      const hash2 = await Integrity.computeHash(dataWithMetadata);
      expect(hash1).toBe(hash2);
    });

    test("should handle nested objects", async () => {
      const data1 = { a: { b: 1 }, c: [1, 2, 3] };
      const data2 = { a: { b: 1 }, c: [1, 2, 3] };
      const data3 = { a: { b: 2 }, c: [1, 2, 3] };

      const hash1 = await Integrity.computeHash(data1);
      const hash2 = await Integrity.computeHash(data2);
      const hash3 = await Integrity.computeHash(data3);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });

    test("is sensitive to other data changes", async () => {
      const hash1 = await Integrity.computeHash({ content: "test" });
      const hash2 = await Integrity.computeHash({ content: "test!" });
      expect(hash1).not.toBe(hash2);
    });

    test("handles primitive values", async () => {
      const hashString = await Integrity.computeHash("just a string");
      const hashNumber = await Integrity.computeHash(42);
      const hashNull = await Integrity.computeHash(null);

      expect(hashString).toMatch(/^[0-9a-f]{64}$/);
      expect(hashNumber).toMatch(/^[0-9a-f]{64}$/);
      expect(hashNull).toMatch(/^[0-9a-f]{64}$/);
    });

    test("handles empty objects", async () => {
      const hash = await Integrity.computeHash({});
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
