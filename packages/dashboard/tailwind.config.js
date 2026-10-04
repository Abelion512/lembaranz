/** @type {import('tailwindcss').Config} */

/**
 * One palette, one light source.
 *
 * The product is a vault, so the page is lit the way a room is: a warm charcoal
 * ground, a cream ground, and a single sand accent that everything interactive
 * borrows. No second accent hue exists anywhere in the product, which is what
 * keeps a marketing page and a locked vault reading as the same object.
 *
 * The type is deliberately system-only. A product whose FAQ says it makes no
 * network requests cannot also pull a display serif off a font CDN, and a
 * visitor who unlocks a vault deserves the same type as a visitor who never
 * does. The serif stack leads with the best face already on the machine and
 * falls back to Georgia, which every target OS ships.
 */
const display = [
  'Iowan Old Style',
  'Palatino Linotype',
  'Palatino',
  'Book Antiqua',
  'Apple Garamond',
  'Georgia',
  'ui-serif',
  'serif',
];

const sans = [
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
];

const mono = [
  'ui-monospace',
  'SFMono-Regular',
  'SF Mono',
  'Menlo',
  'Consolas',
  'Liberation Mono',
  'monospace',
];

export default {
  // `__tests__` is excluded on purpose. Tailwind scans text, not meaning, so a
  // utility named inside a test file (even in a comment, as in
  // `class-compile.test.ts`) is emitted into the production stylesheet. Every
  // rule a test names but no component uses is dead weight shipped to visitors.
  // The touch-target suite compiles this same config, so it measures exactly
  // the stylesheet `vite build` produces.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '!./src/__tests__/**'],
  theme: {
    extend: {
      fontFamily: { display, sans, mono },
      colors: {
        // The dark ground, in three luminance steps. Hierarchy comes from the
        // step, never from a border.
        ink: { DEFAULT: '#16130F', soft: '#1E1A15', raised: '#272119' },
        // The light ground, so the page is not one unbroken dark scroll.
        paper: { DEFAULT: '#F6F1E8', soft: '#EDE5D8', deep: '#E1D5C1' },
        // The one accent. `sand` on ink, `sand-ink` on paper.
        //
        // On the dark ground every text colour is used directly. On the cream
        // ground, muted text is `ink` at a percentage, and the percentage has to
        // be measured: composited over `paper`, `/45` lands at 2.93:1 and
        // `/55` at 3.96:1, both under WCAG AA for normal text. `/60` is the
        // floor (4.65:1) and nothing on the cream ground may go below it.
        sand: { DEFAULT: '#D8B98C', deep: '#BF9F6F', ink: '#8A6636' },
        cream: '#F4EEE4',
        // Secondary and tertiary text on the dark ground. Measured against
        // `ink`: cream 16.0:1, sand 9.9:1, muted 8.5:1, sage 8.6:1,
        // alert 5.9:1, faint 5.7:1. All clear WCAG AA for normal text.
        muted: '#BCAE99',
        faint: '#9B8D79',
        // Signal colours. Warm, so a red alert still belongs to the same room.
        alert: '#E0705F',
        sage: '#8FBE72',
        // Hairline on the dark ground. The light ground uses `ink/15`.
        line: 'rgba(236, 224, 205, 0.16)',
      },
      boxShadow: {
        // One lift, used only by the translucent cards that sit over the hero.
        lift: '0 28px 70px -34px rgba(0, 0, 0, 0.78)',
      },
    },
  },
  plugins: [],
};