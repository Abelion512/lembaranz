import { Marked } from "marked";

/**
 * Robustly checks for dangerous URLs that might bypass basic regex checks.
 * Handles entity decoding, URI decoding, and whitespace stripping.
 */
function isDangerousUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  let decoded = url;

  // 1. Decode HTML entities (hex, decimal, and specific named ones like &colon;)
  decoded = decoded.replace(
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
      return match; // Return as-is if not matched to specific entities we care about
    }
  );

  // 2. Decode URI components
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Fail securely: if decoding fails, we continue with the partially decoded string.
    // This prevents malformed %-sequences from hiding dangerous payloads.
  }

  // 3. Aggressively strip whitespace and control characters [\x00-\x20]
  // Impact: Neutralizes "jav ascript:" or "javascript\n:" bypasses.
  decoded = decoded.replace(/[\x00-\x20]+/g, "");

  // 4. Test against dangerous schemes
  const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
  return dangerousSchemes.test(decoded);
}

/**
 * Hardened Markdown Renderer:
 * 1. Blocks raw HTML injection.
 * 2. Filters dangerous protocols (XSS) in links and images.
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

      // Security: Reject dangerous protocols (XSS)
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
