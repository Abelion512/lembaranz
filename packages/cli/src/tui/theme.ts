/**
 * TUI design tokens.
 *
 * `UI_TOKENS` holds the colour palette and `UI_SYMBOLS` the glyphs. Screens
 * reference these rather than raw colour strings so the palette stays
 * consistent and `bun run lint:design` can check contrast centrally.
 */
export const UI_TOKENS = {
  brand: '#818cf8',      // Indigo-400 (The "Better Purple")
  accent: '#38bdf8',     // Sky-400
  text: '#F8FAFC',       // Slate-50
  meta: '#64748B',       // Slate-500
  danger: '#F43F5E'      // Rose-500
};

export const UI_SYMBOLS = {
  indicator: '>',
  dir: '[dir]',
  lst: '[lst]',
  cfg: '[cfg]',
  doc: '[doc]',
  ext: '[ext]',
  bullet: '·'
};
