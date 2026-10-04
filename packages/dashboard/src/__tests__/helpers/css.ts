/**
 * Compiles the project's real Tailwind stylesheet and injects it into jsdom.
 *
 * Rule 8 asks for touch targets to be verified against rendered markup rather
 * than source. Reading a component file and pattern-matching `min-h-[44px]`
 * would only prove the string is present, which is exactly the check that let
 * undersized controls through in the first place. Running the actual Tailwind
 * pipeline and letting the CSS cascade resolve the box means a class that was
 * renamed, overridden, or dropped fails the test.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

let injected = false;
let compiled = '';

/**
 * Idempotent: the stylesheet is compiled once per worker and shared. jsdom keeps
 * the cascade, so the rules stay live for every later `getComputedStyle`.
 *
 * Returns the compiled CSS as well, because the class-compilation suite needs to
 * assert that a utility the source names actually became a rule. Compiling twice
 * from a second code path would let the two suites disagree about what the
 * stylesheet says.
 */
export async function installTailwind(): Promise<string> {
  if (injected) return compiled;

  const root = process.cwd();
  const config = (await import(resolve(root, 'tailwind.config.js'))).default as Parameters<typeof tailwindcss>[0];
  const source = readFileSync(resolve(root, 'src/index.css'), 'utf8');
  const { css } = await postcss([tailwindcss(config), autoprefixer()]).process(source, { from: undefined });

  if (!css.includes('min-height')) {
    throw new Error('Tailwind produced no min-height utilities; the cascade check would pass vacuously.');
  }

  const style = document.createElement('style');
  style.setAttribute('data-tailwind', 'test');
  style.textContent = css;
  document.head.appendChild(style);
  injected = true;
  compiled = css;
  return css;
}