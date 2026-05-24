import { Marked } from "marked";

/**
 * Robustly checks for dangerous URLs that might bypass basic regex checks.
 * Handles entity decoding, URI decoding, and aggressive whitespace stripping.
 * Impact: Neutralizes "jav ascript:", "javascript&#58;", and malformed URI bypasses.
 */
function isDangerousUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  // 1. Decode HTML entities (named, hex, and decimal)
  let normalized = url.replace(
    /&(#(?:\d+)|(?:#x[0-9a-fA-F]+)|(?:\w+));?/gi,
    (match, n) => {
      n = n.toLowerCase();
      if (n === "colon") return ":";
      if (n === "tab") return "\t";
      if (n === "newline") return "\n";
      if (n.charAt(0) === "#") {
        return n.charAt(1) === "x"
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return match;
    }
  );

  // 2. Decode URI components
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Fail securely: continue with partially decoded string to catch obfuscated payloads
  }

  // 3. Aggressively strip all whitespace and control characters [\x00-\x20]
  normalized = normalized.replace(/[\x00-\x20]+/g, "").toLowerCase();

  // 4. Test against dangerous schemes
  const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
  return dangerousSchemes.test(normalized);
}

/**
 * Hardened Markdown Renderer:
 * 1. Blocks raw HTML injection.
 * 2. Filters dangerous protocols (XSS) in links and images with normalization.
 * 3. Escapes all user-provided attributes (href, src, alt, title).
 * 4. Adds security headers for external links.
 */
export const safeMarked = new Marked({ gfm: true });

safeMarked.use({
  renderer: {
    html() {
      return ""; // Block raw HTML execution
    },
    link(token) {
      const { href, text, title } = token;

      // Security: Validate URL scheme to prevent XSS (javascript:, etc.)
      if (isDangerousUrl(href)) {
        return `<span>${text}</span>`;
      }

      // Security: Standard escaping for attributes
      const safeHref = href
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeTitle = title
        ? title
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        : "";

      const isExternal = href.startsWith("http");
      const rel = isExternal ? 'rel="noopener noreferrer" target="_blank"' : "";
      const titleAttr = safeTitle ? `title="${safeTitle}"` : "";

      return `<a href="${safeHref}" ${rel} ${titleAttr}>${text}</a>`;
    },
    image(token) {
      const { href, text, title } = token;

      // Security: Reject dangerous protocols for images (XSS)
      if (isDangerousUrl(href)) {
        return `<span>${text}</span>`;
      }

      // Security: Standard escaping for attributes
      const safeHref = href
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeTitle = title
        ? title
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        : "";
      const safeText = text
        ? text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        : "";

      const titleAttr = safeTitle ? `title="${safeTitle}"` : "";

      return `<img src="${safeHref}" alt="${safeText}" ${titleAttr} />`;
    },
  },
});
