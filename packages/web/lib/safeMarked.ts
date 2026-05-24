import { Marked } from 'marked';

function isDangerousUrl(url: string): boolean {
    try {
        let decoded = url;
        try {
            decoded = decodeURIComponent(url);
        } catch { }
        decoded = decoded.replace(/&#[xX]([A-Fa-f0-9]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        decoded = decoded.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
        decoded = decoded.replace(/[\x00-\x20]+/g, '');
        return /^(javascript|data|vbscript|file):/i.test(decoded);
    } catch {
        return true; // Fail secure
    }
}

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */
export const safeMarked = new Marked({ gfm: true });

safeMarked.use({
    renderer: {
        html() {
            return ''; // Blokir eksekusi HTML mentah dalam markdown
        },
        link(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            // Keamanan: Tolak protokol berbahaya (XSS)
            if (isDangerousUrl(href)) {
                return `<span>${text}</span>`;
            }

            // Keamanan: Tambahkan atribut pengaman untuk link eksternal
            const isExternal = href.startsWith('http');
            const rel = isExternal ? 'rel="noopener noreferrer" target="_blank"' : '';
            // XSS fix: Escape href and title attribute value
            const safeHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeTitle = title ? title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const titleAttr = safeTitle ? `title="${safeTitle}"` : '';

            return `<a href="${safeHref}" ${rel} ${titleAttr}>${text}</a>`;
        },
        image(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            // Keamanan: Tolak protokol berbahaya pada gambar (XSS)
            if (isDangerousUrl(href)) {
                return `<span>${text}</span>`;
            }

            // XSS fix: Escape href, text, and title attribute value
            const safeHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeTitle = title ? title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const titleAttr = safeTitle ? `title="${safeTitle}"` : '';
            const safeText = text ? text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            return `<img src="${safeHref}" alt="${safeText}" ${titleAttr} />`;
        }
    }
});
