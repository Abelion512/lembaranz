import { Marked } from 'marked';

/**
 * Hardening Renderer Markdown:
 * 1. Blokir raw HTML.
 * 2. Filter protokol berbahaya pada link.
 * 3. Tambahkan rel="noopener noreferrer" pada link eksternal.
 */
/**
 * Helper to unescape HTML entities, decode URL, and strip whitespace/control characters
 * before checking for dangerous schemes to prevent XSS bypasses.
 */
function isDangerousUrl(url: string): boolean {
    if (!url) return false;

    // 1. Unescape HTML entities that marked might have left
    let normalized = url.replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .replace(/&#x([a-fA-F0-9]+);/g, (m, p1) => String.fromCharCode(parseInt(p1, 16)))
                      .replace(/&#(\d+);/g, (m, p1) => String.fromCharCode(parseInt(p1, 10)));

    // 2. Decode URI component if possible
    try {
        normalized = decodeURIComponent(normalized);
    } catch (_e) {
        // Ignore invalid URI components
    }

    // 3. Strip all non-printable/whitespace characters (including spaces, tabs, newlines, etc.)
    normalized = normalized.replace(/[\x00-\x20]+/g, '').toLowerCase();

    // 4. Test against dangerous schemes
    const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
    return dangerousSchemes.test(normalized);
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

            // Keamanan: Tolak protokol berbahaya (XSS) dan bypass encoding/whitespace
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

            // Keamanan: Tolak protokol berbahaya pada gambar (XSS) dan bypass encoding/whitespace
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
