import { expect, test, describe } from "bun:test";
import { stripHtml, truncate } from "../Penyaring";

describe("Penyaring - stripHtml", () => {
    test("harus menangani string kosong", () => {
        expect(stripHtml("")).toBe("");
    });

    test("harus membiarkan teks polos tanpa perubahan", () => {
        const input = "Halo Dunia";
        expect(stripHtml(input)).toBe(input);
    });

    test("harus menghapus tag HTML sederhana", () => {
        expect(stripHtml("<p>Halo Dunia</p>")).toBe("Halo Dunia");
        expect(stripHtml("<b>Tebal</b>")).toBe("Tebal");
    });

    test("harus menghapus tag bertumpuk (nested)", () => {
        expect(stripHtml("<div><p>Halo <span>Dunia</span></p></div>")).toBe("Halo Dunia");
    });

    test("harus menghapus tag dengan atribut", () => {
        expect(stripHtml('<a href="https://example.com" title="Contoh">Klik Di Sini</a>')).toBe("Klik Di Sini");
        expect(stripHtml('<div class="container" id="utama">Konten</div>')).toBe("Konten");
    });

    test("harus menangani tag yang tidak lengkap atau malformed", () => {
        // Tag pembuka tanpa penutup
        expect(stripHtml("<p>Teks")).toBe("Teks");
        // Tag malformed
        expect(stripHtml("<div class='test' Konten")).toBe("");
    });
});

describe("Penyaring - truncate", () => {
    test("harus mengembalikan string asli jika lebih pendek dari limit", () => {
        const input = "Halo";
        expect(truncate(input, 10)).toBe(input);
    });

    test("harus mengembalikan string asli jika panjangnya sama dengan limit", () => {
        const input = "Halo";
        expect(truncate(input, 4)).toBe(input);
    });

    test("harus memotong string dan menambah elipsis jika melebihi limit", () => {
        expect(truncate("Halo Dunia", 4)).toBe("Halo...");
        expect(truncate("Lembaran Catatan", 8)).toBe("Lembaran...");
    });

    test("harus menangani string kosong", () => {
        expect(truncate("", 10)).toBe("");
    });

    test("harus menangani limit nol", () => {
        expect(truncate("Halo", 0)).toBe("...");
    });

    test("harus menangani karakter multi-byte (emoji)", () => {
        const emoji = "👋🌍"; // length is 4 due to surrogate pairs
        expect(truncate(emoji, 2)).toBe("👋...");
        expect(truncate(emoji, 4)).toBe(emoji);
    });
});
