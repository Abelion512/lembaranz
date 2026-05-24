import { Marked } from 'marked';

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */
export const safeMarked = new Marked({ gfm: true });

function isDangerousUrl(url: string): boolean {
    if (!url) return true;
    try {
        // Decode HTML entities
        let unescaped = url.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                           .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

        // Decode URI components safely
        let decoded = '';
        try {
            decoded = decodeURIComponent(unescaped);
        } catch {
            let res = '';
            for(let i=0; i<unescaped.length; i++) {
                if (unescaped[i] === '%' && i+2 < unescaped.length) {
                    res += String.fromCharCode(parseInt(unescaped.substring(i+1, i+3), 16));
                    i += 2;
                } else {
                    res += unescaped[i];
                }
            }
            decoded = res;
        }

        // Strip whitespaces and control chars
        let cleaned = decoded.replace(/[\x00-\x20]+/g, '').toLowerCase();
        return /^(javascript|data|vbscript|file):/i.test(cleaned);
    } catch {
        return true;
    }
}

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
