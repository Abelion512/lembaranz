import { expect, test, describe } from "bun:test";
import { Marked } from 'marked';

// Kita uji logika renderer yang sama dengan yang ada di MarkdownRenderer
const markdownRenderer = new Marked({ gfm: true });
markdownRenderer.use({
    renderer: {
        html() {
            return ''; 
        },
        link(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
            if (dangerousSchemes.test(href)) {
                return `<span>${text}</span>`;
            }

            const isExternal = href.startsWith('http');
            const rel = isExternal ? 'rel="noopener noreferrer" target="_blank"' : '';
            const titleAttr = title ? `title="${title}"` : '';

            return `<a href="${href}" ${rel} ${titleAttr}>${text}</a>`;
        }
    }
});

describe("MarkdownRenderer Hardening", () => {
    test("harus memblokir raw HTML tags", async () => {
        const md = "Hello <script>alert(1)</script> World";
        const html = await markdownRenderer.parse(md);
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("</script>");
    });

    test("harus menetralkan link javascript:", async () => {
        const md = "[Klik Saya](javascript:alert(1))";
        const html = await markdownRenderer.parse(md);
        expect(html).toContain("<span>Klik Saya</span>");
        expect(html).not.toContain("href=");
    });

    test("harus menambahkan rel pada link eksternal", async () => {
        const md = "[Google](https://google.com)";
        const html = await markdownRenderer.parse(md);
        expect(html).toContain('rel="noopener noreferrer"');
        expect(html).toContain('target="_blank"');
    });

    test("harus merender markdown normal dengan benar", async () => {
        const md = "# Judul\n**Tebal**";
        const html = await markdownRenderer.parse(md);
        expect(html).toContain("<h1>Judul</h1>");
        expect(html).toContain("strong>Tebal</strong>");
    });
});
