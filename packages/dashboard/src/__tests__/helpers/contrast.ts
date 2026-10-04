/**
 * WCAG 2.1 contrast, measured against the colour the browser would actually
 * paint.
 *
 * This exists rather than a table of approved pairs because half the palette is
 * used at an alpha (`text-ink/60`, `text-muted` over a translucent card), so the
 * foreground that reaches the eye is a composite, not the swatch. A pair table
 * cannot see that, and the composite is exactly where the failures live.
 *
 * Two things make a naive reading wrong here and both are handled:
 *
 *  - Alpha stacking. `.glass` is `rgba(244,238,228,0.055)` sitting on top of
 *    `.hero-field`, which is itself a gradient over `#16130f`. The backdrop of
 *    one label is three layers deep.
 *  - Gradients. The three section grounds paint a `background-image` over a flat
 *    `background-color`, so a single backdrop value is a fiction. The ratio is
 *    computed against the flat base *and* against every colour the wash can
 *    reach, and the worst of those is the one reported.
 */

export type Rgb = { r: number; g: number; b: number };

/** Parses `#rgb`, `#rrggbb`, `rgb()` and `rgba()`. Returns null when unparseable. */
export function parseColour(input: string): { rgb: Rgb; alpha: number } | null {
  const value = input.trim().toLowerCase();
  if (value === 'transparent') return { rgb: { r: 0, g: 0, b: 0 }, alpha: 0 };

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value);
  if (hex) {
    const digits = hex[1]!;
    const full =
      digits.length === 3
        ? digits
            .split('')
            .map((d) => d + d)
            .join('')
        : digits;
    return {
      rgb: {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
      },
      alpha: 1,
    };
  }

  const fn = /^rgba?\(([^)]*)\)$/.exec(value);
  if (!fn) return null;
  const parts = fn[1]!.split(/[,\s/]+/).filter(Boolean);
  const channel = (raw: string): number =>
    raw.endsWith('%') ? Math.round((Number(raw.slice(0, -1)) / 100) * 255) : Number(raw);
  if (parts.length < 3) return null;
  const alpha = parts[3] === undefined ? 1 : Number(parts[3]);
  if (!Number.isFinite(alpha)) return null;
  return { rgb: { r: channel(parts[0]!), g: channel(parts[1]!), b: channel(parts[2]!) }, alpha };
}

/**
 * Resolves a computed colour, substituting the custom properties jsdom leaves
 * in place.
 *
 * Tailwind writes `color: rgb(22 19 15 / var(--tw-text-opacity, 1))` and sets
 * `--tw-text-opacity` alongside it. jsdom exposes that custom property through
 * `getPropertyValue` but does not substitute it into `color`, so the raw string
 * arrives with a `var()` in the alpha slot and a naive parse rejects it. That
 * rejection is silent: on the landing page it dropped 130 of 181 runs of text,
 * leaving the suite measuring a quarter of the page and reporting it clean.
 *
 * `resolveVar` supplies the live value of a custom property, so `text-ink/60`
 * is read at 0.6 and `text-ink` at 1, exactly as a browser would paint them.
 */
export function parseComputedColour(
  value: string,
  resolveVar: (name: string) => string | null,
): { rgb: Rgb; alpha: number } | null {
  const direct = parseColour(value);
  if (direct) return direct;

  // Not a regex. `var(--tw-text-opacity, 1)` has its own parentheses, so any
  // pattern of the form `^rgba?\(([^)]+)\)$` stops at the inner `)` and rejects
  // the value outright. Slicing between the first `(` and the last `)` handles
  // the nesting, and the `var()` slot is matched on the slice.
  const raw = value.trim().toLowerCase();
  const open = raw.indexOf('(');
  const close = raw.lastIndexOf(')');
  if (open === -1 || close <= open) return null;

  const parts = raw.slice(open + 1, close).split('/');
  if (parts.length < 2) return null;

  const rgb = parseColour(`rgb(${parts[0]!.trim()})`);
  if (!rgb) return null;

  const asVar = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(parts[1]!.trim());
  if (!asVar) return null;

  const live = resolveVar(asVar[1]!);
  const chosen = live !== null && live.trim() !== '' ? live : asVar[2];
  if (chosen === undefined) return null;
  const alpha = Number(chosen);
  return Number.isFinite(alpha) ? { rgb: rgb.rgb, alpha } : null;
}

/** Reads a colour property off a computed style, resolving its custom property. */
export function computedColour(
  cs: CSSStyleDeclaration,
  property: 'color' | 'backgroundColor',
): { rgb: Rgb; alpha: number } | null {
  // The camelCase accessor, not `getPropertyValue`. jsdom answers
  // `cs.color` and leaves `cs.getPropertyValue('color')` empty, so reading it
  // the obvious way silently yields null for every element on the page.
  const value = property === 'color' ? cs.color : cs.backgroundColor;
  return parseComputedColour(value, (name) => cs.getPropertyValue(name));
}

/** Source-over composite: `top` painted onto opaque `bottom`. */
export const composite = (top: { rgb: Rgb; alpha: number }, bottom: Rgb): Rgb => {
  const a = Math.max(0, Math.min(1, top.alpha));
  return {
    r: top.rgb.r * a + bottom.r * (1 - a),
    g: top.rgb.g * a + bottom.g * (1 - a),
    b: top.rgb.b * a + bottom.b * (1 - a),
  };
};

/** WCAG relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (raw: number): number => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1 to 21. */
export const ratio = (a: Rgb, b: Rgb): number => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/**
 * Every colour a `background-image` can paint, as opaque-ish layers.
 *
 * The section grounds build their wash from `radial-gradient(..., rgba(...),
 * rgba(...))`. The stops are the only colours that can appear, so they bound
 * the backdrop. Alpha is kept because the wash is painted over the base, not
 * instead of it.
 */
export function washColours(backgroundImage: string): { rgb: Rgb; alpha: number }[] {
  if (!backgroundImage || backgroundImage === 'none') return [];
  const out: { rgb: Rgb; alpha: number }[] = [];
  for (const match of backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)) {
    const parsed = parseColour(match[0]!);
    if (parsed) out.push(parsed);
  }
  return out;
}
