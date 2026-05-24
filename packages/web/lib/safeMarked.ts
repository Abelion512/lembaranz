import { Marked } from 'marked';

/**
 * Helper to check if a URL uses a dangerous protocol to prevent XSS.
 * It decodes URI components, unescapes HTML entities, and strips whitespace/control characters.
 */
function isDangerousUrl(url: string): boolean {
    if (!url) return false;

    let current = url;
    let previous = '';

    while (current !== previous) {
        previous = current;

        // Unescape HTML entities
        current = current.replace(/&#[xX]([0-9a-fA-F]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        current = current.replace(/&#([0-9]+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
        const entities: Record<string, string> = {
            '&colon;': ':', '&tab;': '\t', '&newline;': '\n', '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>'
        };
        for (const [entity, char] of Object.entries(entities)) {
            current = current.replace(new RegExp(entity, 'gi'), char);
        }

        // Decode URI components safely
        try {
            current = decodeURIComponent(current);
        } catch {
            let temp = '';
            for (let i = 0; i < current.length; i++) {
                if (current[i] === '%' && i + 2 < current.length) {
                    const parsed = parseInt(current.substring(i + 1, i + 3), 16);
                    if (!isNaN(parsed)) {
                        temp += String.fromCharCode(parsed);
                        i += 2;
                        continue;
                    }
                }
                temp += current[i];
            }
            current = temp;
        }
    }

    // Strip whitespace and control characters (including backslash used for evasion)
    const sanitized = current.replace(/[\x00-\x20\\]+/g, '').toLowerCase();
    const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
    return dangerousSchemes.test(sanitized);
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

            // Keamanan: Tolak protokol berbahaya dengan penanganan encoding (XSS)
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

            // Keamanan: Tolak protokol berbahaya pada gambar dengan penanganan encoding (XSS)
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
