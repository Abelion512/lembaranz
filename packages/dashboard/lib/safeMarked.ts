import { Marked } from 'marked';

/**
 * Helper to check for dangerous URLs that might bypass basic regex checks
 */
function isDangerousUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    let decoded = url;
    let previous = "";
    let loopCount = 0;

    while (decoded !== previous && loopCount < 5) {
        previous = decoded;
        try {
            decoded = decodeURIComponent(decoded);
        } catch (_e) {
            // Fallback: manual character-by-character decode for malformed URIs
            decoded = decoded.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
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

        loopCount++;
    }

    return /^(javascript|data|vbscript|file):/i.test(decoded);
}

/**
 * Hardening Markdown Renderer:
 * 1. Block raw HTML.
 * 2. Filter dangerous protocols on links.
 * 3. Add rel="noopener noreferrer" to external links.
 */
export const safeMarked = new Marked({ gfm: true });

safeMarked.use({
    renderer: {
        html() {
            return ''; // Block raw HTML execution in markdown
        },
        link(token) {
            const href = token.href;
            const text = token.text;
            const title = token.title;

            const safeText = text ? text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            // Security: Reject dangerous protocols (XSS)
            if (isDangerousUrl(href)) {
                return `<span>${safeText}</span>`;
            }

            // Security: Add security attributes for external links
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

            // Security: Reject dangerous protocols on images (XSS)
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
