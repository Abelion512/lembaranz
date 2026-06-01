import { Marked } from 'marked';

/**
 * Helper to check for dangerous URLs that might bypass basic regex checks
 */
function isDangerousUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    let decoded = url;
    try {
        decoded = decodeURIComponent(url);
    } catch (_e) {
        // Fallback: manual character-by-character decode for malformed URIs
        decoded = url.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
            try {
                return decodeURIComponent(match);
            } catch {
                return String.fromCharCode(parseInt(hex, 16));
            }
        });
    }

    // Decode HTML entities
    decoded = decoded.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    decoded = decoded.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    decoded = decoded.replace(/&colon;/gi, ':').replace(/&tab;/gi, '\t').replace(/&newline;/gi, '\n');

    // Strip whitespace and control characters
    // eslint-disable-next-line no-control-regex
    decoded = decoded.replace(/[\x00-\x20]+/g, '');

    return /^(javascript|data|vbscript|file):/i.test(decoded);
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

            const safeText = text ? text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            // Keamanan: Tolak protokol berbahaya (XSS)
            if (isDangerousUrl(href)) {
                return `<span>${safeText}</span>`;
            }

            // Keamanan: Tambahkan atribut pengaman untuk link eksternal
            const isExternal = href.startsWith('http');
            const rel = isExternal ? 'rel="noopener noreferrer" target="_blank"' : '';
            // XSS fix: Escape href and title attribute value
            const safeHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeTitle = title ? title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const titleAttr = safeTitle ? `title="${safeTitle}"` : '';

            return `<a href="${safeHref}" ${rel} ${titleAttr}>${safeText}</a>`;
        },
        image(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            const safeText = text ? text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            // Keamanan: Tolak protokol berbahaya pada gambar (XSS)
            if (isDangerousUrl(href)) {
                return `<span>${safeText}</span>`;
            }

            // XSS fix: Escape href, text, and title attribute value
            const safeHref = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeTitle = title ? title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const titleAttr = safeTitle ? `title="${safeTitle}"` : '';

            return `<img src="${safeHref}" alt="${safeText}" ${titleAttr} />`;
        }
    }
});
