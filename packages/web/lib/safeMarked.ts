import { Marked } from 'marked';

/**
 * Unescapes common HTML entities to prevent XSS evasion.
 */
function unescapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&colon;': ':',
    };

    let result = str.replace(/&[a-zA-Z]+;/g, match => htmlEntities[match] || match);
    result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    result = result.replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    return result;
}

/**
 * Validates if a URL contains dangerous schemes, handling evasions via
 * encoding, HTML entities, and whitespace/control characters.
 */
function isDangerousUrl(url: string): boolean {
    if (!url) return false;

    try {
        let processed = unescapeHtml(url);

        try {
            processed = decodeURIComponent(processed);
        } catch {
            // Fallback for malformed URIs
            let temp = '';
            for (let i = 0; i < processed.length; i++) {
                if (processed[i] === '%' && i + 2 < processed.length) {
                    try {
                        temp += decodeURIComponent(processed.substring(i, i + 3));
                        i += 2;
                    } catch {
                        temp += processed[i];
                    }
                } else {
                    temp += processed[i];
                }
            }
            processed = temp;
        }

        // Strip whitespace and control characters [\x00-\x20]
        processed = processed.replace(/[\x00-\x20]+/g, '');
        processed = processed.toLowerCase();

        const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
        return dangerousSchemes.test(processed);
    } catch {
        // Fail securely on unexpected errors
        return true;
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
