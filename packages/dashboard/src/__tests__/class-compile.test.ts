/**
 * Every class named in the source must exist in the compiled stylesheet.
 *
 * Tailwind fails silently. A misspelled variant, a colour that was never added
 * to the theme, or an opacity modifier that is not on the default scale simply
 * produces no rule at all: the element renders, the layout holds, every other
 * test still passes, and the page is quietly wrong. Nothing throws. Nothing
 * warns. The touch-target suite cannot see it, because a control with no border
 * colour is still the right size.
 *
 * This caught `border-ink/12` and `divide-ink/12` during the redesign. `12` is
 * not on Tailwind's default opacity scale, so both classes compiled to nothing
 * and every hairline on the cream sections fell back to the preflight default
 * `#e5e7eb`, a cold grey against a warm ground.
 *
 * The assertion is on the stylesheet, not on prose, and it is falsifiable: drop
 * a class such as `border-ink/12` or `text-sand/33` back into the source and
 * this suite names it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { installTailwind } from './helpers/css';

/**
 * Tailwind's own selector escaping, which is what decides whether a class name
 * appears in the output. Copied from `tailwindcss/lib/util/escape.js` so this
 * suite looks for exactly the string Tailwind would have written, rather than
 * for a substring that happens to match.
 */
const cssEscape = (token: string): string => token.replace(/([^a-zA-Z0-9-_])/g, '\\$1');

/**
 * Utility families worth checking.
 *
 * A token outside this list is not treated as a class: a false positive here
 * would be a test failure that means "refactor the prose", which is worse than
 * the defect it is looking for. Anything with an arbitrary value in brackets
 * always counts, since that is the part of the API most likely to be wrong.
 */
const FAMILIES = [
  'accent', 'animate', 'aspect', 'backdrop', 'bg', 'border', 'bottom', 'box', 'capitalize', 'cursor',
  'divide', 'duration', 'ease', 'flex', 'font', 'from', 'gap', 'grid', 'h', 'hidden', 'hover', 'inset',
  'inline', 'italic', 'items', 'justify', 'leading', 'left', 'lg', 'max', 'md', 'min', 'mx', 'my', 'm',
  'object', 'opacity', 'order', 'outline', 'overflow', 'p', 'placeholder', 'pointer', 'px', 'py', 'pt',
  'pr', 'pb', 'pl', 'relative', 'resize', 'right', 'ring', 'rounded', 'shadow', 'sm', 'space',
  'sr', 'sticky', 'tabular', 'text', 'top', 'tracking', 'transform', 'transition', 'truncate', 'uppercase',
  'via', 'w', 'whitespace', 'z', 'zoom',
];

/**
 * Utilities that are a single bare word. Everything else must carry a dash,
 * which is what separates `grid-cols-2` from `scope="row"`.
 */
const BARE = new Set([
  'antialiased', 'block', 'capitalize', 'flex', 'grid', 'hidden', 'inline', 'italic', 'lowercase',
  'truncate', 'uppercase',
]);

const looksLikeAUtility = (token: string): boolean => {
  // `[data-reveal]` is a CSS selector, not a class. A real arbitrary value
  // always follows a base, so leading `[` means this is a selector.
  if (token.startsWith('[') || token.endsWith(']')) return false;
  const base = token.includes(':') ? token.slice(token.lastIndexOf(':') + 1) : token;
  if (BARE.has(base)) return true;
  if (base.includes('[')) return true;
  return base.includes('-') && FAMILIES.some((family) => base.startsWith(family + '-'));
};

/**
 * Strips comments so prose about a class is never mistaken for one.
 *
 * The `/** ... *\/` block at the top of this file names `min-h-[44px]` in a
 * sentence, and without this the suite would report a class the author only
 * ever wrote down. Line comments are stripped only when they start the line, so
 * a `https://` inside a string literal survives.
 */
const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');

/** Every string literal in a source file, which is where class names live. */
const literalsIn = (source: string): string[] =>
  [...withoutComments(source).matchAll(/(['"`])([^'"`\n]*)\1/g)].map((m) => m[2]);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(path);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [path] : [];
  });

let css = '';
let classNames = new Map<string, Set<string>>();

beforeAll(async () => {
  css = await installTailwind();
  classNames = new Map();
  for (const file of walk(resolve(process.cwd(), 'src'))) {
    for (const literal of literalsIn(readFileSync(file, 'utf8'))) {
      for (const token of literal.split(/\s+/)) {
        if (!token || token.length > 60 || !looksLikeAUtility(token)) continue;
        const seen = classNames.get(token) ?? new Set<string>();
        seen.add(file);
        classNames.set(token, seen);
      }
    }
  }
});

describe('every class in the source compiles', () => {
  it('found the source to check', () => {
    // Without this the walker could return nothing and every assertion below
    // would pass on an empty set.
    expect(classNames.size).toBeGreaterThan(80);
  });

  it('produced a stylesheet with rules in it', () => {
    expect(css.length).toBeGreaterThan(1000);
  });

  it('has a rule for every utility the components name', () => {
    const missing = [...classNames.entries()]
      .filter(([token]) => !css.includes(`.${cssEscape(token)}`))
      .map(([token, files]) => `  ${token}  (${[...files].map((f) => f.split('/').pop()).join(', ')})`);

    expect(missing, `these classes compile to nothing:\n${missing.join('\n')}`).toEqual([]);
  });

  it('never suppresses the focus ring', () => {
    // `outline-none` compiles cleanly, so the suite above cannot see it. It
    // still removes the only visible focus indicator, and the fields that used
    // to carry it are the ones where a master password is typed.
    //
    // Reuses the suite's own tokenisation rather than a regex over the raw text.
    // A regex has to guess what may sit either side of the class name, and the
    // obvious guess is wrong: `focus:outline-none` puts a colon in front of it,
    // so a pattern anchored on whitespace or a quote never fires and the check
    // passes on a file that does suppress the ring.
    const offenders = [...classNames.entries()]
      .filter(([token]) => token === 'outline-none' || token.endsWith(':outline-none'))
      .map(([token, files]) => `  ${token}  (${[...files].map((f) => f.split('/').pop()).join(', ')})`);

    expect(offenders, `these classes remove the focus ring:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('never forces text uppercase', () => {
    // `uppercase` compiles cleanly, so the "every class compiles" assertion
    // above sees nothing wrong with it. It is also invisible to
    // `impeccable detect <path>`, which reads source text, while a browser
    // resolves it to `text-transform: uppercase` and counts every label it
    // reaches. That gap let 23 all-caps strings ship on the landing page while
    // the design gate was green.
    //
    // Two passes, because there are two ways in. A component can name the
    // utility directly, or a shared class can `@apply` it in `index.css`,
    // which the walker below never visits. The second pass reads the compiled
    // stylesheet, so it catches both and any other route to the property.
    const offenders: string[] = [];

    for (const [token, files] of classNames) {
      const base = token.includes(':') ? token.slice(token.lastIndexOf(':') + 1) : token;
      if (base === 'uppercase') {
        offenders.push(`  class ${token}  (${[...files].map((f) => f.split('/').pop()).join(', ')})`);
      }
    }

    // Comments are stripped first, or the selector reported is the doc comment
    // that happens to sit above the rule rather than the rule itself.
    for (const rule of css.replace(/\/\*[\s\S]*?\*\//g, ' ').split('}')) {
      if (!/text-transform:\s*uppercase/i.test(rule)) continue;
      offenders.push(`  compiled rule ${rule.split('{')[0]!.trim()}`);
    }

    expect(offenders, `these set text-transform: uppercase:\n${offenders.join('\n')}`).toEqual([]);
  });
});