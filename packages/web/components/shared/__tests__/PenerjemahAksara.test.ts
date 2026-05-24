import { expect, test, describe } from "bun:test";
import { safeMarked } from '../../../lib/safeMarked';

describe("MarkdownRenderer Hardening", () => {
    test("harus memblokir raw HTML tags", async () => {
        const md = "Hello <script>alert(1)</script> World";
        const html = await safeMarked.parse(md);
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("</script>");
    });

    test("harus menetralkan link javascript:", async () => {
        const md = "[Klik Saya](javascript:alert(1))";
        const html = await safeMarked.parse(md);
        expect(html).toContain("<span>Klik Saya</span>");
        expect(html).not.toContain("href=");
    });

    test("harus menetralkan link javascript bypass entitas:", async () => {
        const md = "[Klik Saya](javascript&#58;alert(1))";
        const html = await safeMarked.parse(md);
        expect(html).toContain("<span>Klik Saya</span>");
        expect(html).not.toContain("href=");
    });

    test("harus menetralkan link javascript bypass spasi:", async () => {
        const md = "[Klik Saya](jav&#x09;ascript:alert(1))";
        const html = await safeMarked.parse(md);
        expect(html).toContain("<span>Klik Saya</span>");
        expect(html).not.toContain("href=");
    });

    test("harus menetralkan link data bypass:", async () => {
        const md = "[Klik Saya](d&#x61;t&#x61;:text/html,alert(1))";
        const html = await safeMarked.parse(md);
        expect(html).toContain("<span>Klik Saya</span>");
        expect(html).not.toContain("href=");
    });

    test("harus menambahkan rel pada link eksternal", async () => {
        const md = "[Google](https://google.com)";
        const html = await safeMarked.parse(md);
        expect(html).toContain('rel="noopener noreferrer"');
        expect(html).toContain('target="_blank"');
    });

    test("harus merender markdown normal dengan benar", async () => {
        const md = "# Judul\n**Tebal**";
        const html = await safeMarked.parse(md);
        expect(html).toContain("<h1>Judul</h1>");
        expect(html).toContain("strong>Tebal</strong>");
    });
});
