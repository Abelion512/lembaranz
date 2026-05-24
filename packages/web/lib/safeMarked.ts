import { Marked } from 'marked';

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */

function isDangerousUrl(url: string): boolean {
    let normalized = url;

    // Unescape entities
    normalized = normalized.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
                           .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                           .replace(/&colon;/gi, ':');

    try {
        normalized = decodeURIComponent(normalized);
    } catch {
        // Fallback: decode character by character if malformed
        let decoded = '';
        for (let i = 0; i < normalized.length; i++) {
            if (normalized[i] === '%' && i + 2 < normalized.length) {
                const hex = normalized.substring(i + 1, i + 3);
                if (/^[0-9a-f]{2}$/i.test(hex)) {
                    decoded += String.fromCharCode(parseInt(hex, 16));
                    i += 2;
                    continue;
                }
            }
            decoded += normalized[i];
        }
        normalized = decoded;
    }

    normalized = normalized.replace(/[\x00-\x20]+/g, '');

    return /^(javascript|data|vbscript|file):/i.test(normalized);
}

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
