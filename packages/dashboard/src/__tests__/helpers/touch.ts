/**
 * Measures an element's resolved box from the CSS cascade.
 *
 * jsdom has no layout engine, so `getBoundingClientRect()` returns zeros for
 * everything and is useless here. What jsdom *does* implement faithfully is the
 * cascade: given the real compiled stylesheet, `getComputedStyle` resolves the
 * winning declaration for every property. So the box is reconstructed from the
 * resolved declarations rather than from a hardcoded assumption about which
 * utility class each screen uses.
 *
 * The reconstruction is deliberately conservative:
 *
 *  - Height is `max(min-height, height, padding-block + one line box)`. A
 *    declared floor wins outright, which is what a `min-h-[44px]` control has.
 *  - A content line box is estimated from the resolved `line-height`, falling
 *    back to `font-size * 1.2`. It is a floor, never a justification: an
 *    element that relies on padding alone has to clear 44px on that estimate.
 *  - Width is `max(min-width, width)`. A percentage or `auto` width cannot be
 *    measured without layout, so those are handled explicitly rather than being
 *    quietly treated as passing.
 */
export const MIN_TAP = 44;

/** Resolves a CSS length to pixels. `rem`/`em` use the 16px root. */
function px(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'auto' || trimmed === 'none' || trimmed === 'normal') return null;
  const match = /^(-?\d*\.?\d+)(px|rem|em|pt)?$/.exec(trimmed);
  if (!match) return null;
  const magnitude = Number(match[1]);
  if (!Number.isFinite(magnitude)) return null;
  switch (match[2]) {
    case undefined:
      return magnitude;
    case 'px':
      return magnitude;
    case 'pt':
      return (magnitude * 96) / 72;
    default:
      return magnitude * 16;
  }
}

/**
 * Resolves `line-height`, which is the one length that may be unitless.
 *
 * A bare number is a multiplier of the font size, not a pixel count. Tailwind's
 * preflight sets `html { line-height: 1.5 }`, so reading it as pixels yields
 * 1.5px and every padding-based height collapses to a nonsense value. Getting
 * this wrong silently passes controls that are genuinely too small, so it is
 * resolved properly rather than folded into `px`.
 */
function lineBox(cs: CSSStyleDeclaration): number {
  const fontSize = px(cs.fontSize) ?? 16;
  const raw = cs.lineHeight.trim();
  const unitless = /^(-?\d*\.?\d+)$/.exec(raw);
  if (unitless) return Number(unitless[1]) * fontSize;
  return px(raw) ?? fontSize * 1.2;
}

/**
 * True when the element is block-level, so its used width is its container's.
 *
 * `display: flex` is block-level even though it is not literally `block`, and
 * every full-width button in the app is a flex container. Without this, a
 * `w-full`-equivalent control reads as `width: auto` and looks unmeasurable.
 */
const BLOCK_LEVEL = new Set(['block', 'flex', 'grid', 'list-item', 'flow-root', 'table']);

export interface Measurement {
  /** Resolved height floor in px, or null when the height fills its container. */
  height: number | null;
  /** Resolved width in px, or null when the width fills its container. */
  width: number | null;
  /** True when the width fills its container and so is bounded by it. */
  fillsWidth: boolean;
}

/** Anything a person can click, tap, focus, or type into. */
const INTERACTIVE = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Elements that are deliberately not visible until focused, e.g. a skip link. */
const visuallyHidden = (el: Element): boolean => el.classList.contains('sr-only') || el.classList.contains('hidden');

/**
 * The element a user actually taps.
 *
 * A checkbox rendered at 16x16 is not a 16x16 target when it sits inside a
 * label: clicking the label toggles it, so the label is the hit area. Where no
 * label exists the input is genuinely its own target and is measured as-is.
 */
function hitTarget(el: Element): Element {
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    return el.closest('label') ?? el;
  }
  return el;
}

/** A short, stable description for the failure message. */
export function describeControl(el: Element): string {
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
  const label = el.getAttribute('aria-label') ?? el.getAttribute('title') ?? text.slice(0, 40);
  return `<${el.tagName.toLowerCase()}${el.getAttribute('type') ? ` type=${el.getAttribute('type')}` : ''}${
    label ? ` "${label}"` : ''
  }> class="${el.getAttribute('class') ?? ''}"`;
}

export function measure(el: Element): Measurement {
  const cs = getComputedStyle(el);

  const declaredHeight = cs.height.trim();
  // `height: 100%` sizes to the container, exactly like `width: 100%`. Without a
  // layout engine the container is unknown, so the axis is reported as
  // container-determined rather than guessed at.
  const fillsHeight = declaredHeight.endsWith('%');
  const minHeight = px(cs.minHeight) ?? 0;
  const fixedHeight = px(declaredHeight) ?? 0;
  const paddingBlock = (px(cs.paddingTop) ?? 0) + (px(cs.paddingBottom) ?? 0);
  const height = fillsHeight && minHeight === 0 ? null : Math.max(minHeight, fixedHeight, paddingBlock + lineBox(cs));

  const minWidth = px(cs.minWidth) ?? 0;
  const declaredWidth = cs.width.trim();
  const fillsWidth = declaredWidth.endsWith('%') || BLOCK_LEVEL.has(cs.display.trim());
  const fixedWidth = px(declaredWidth) ?? 0;

  return { height, width: fillsWidth ? null : Math.max(minWidth, fixedWidth), fillsWidth };
}

export interface Undersized {
  control: string;
  axis: 'height' | 'width';
  actual: number | null;
  required: number;
}

/** Every interactive control inside `root`, skipping visually hidden ones. */
export function interactiveControls(root: ParentNode): Element[] {
  return [...root.querySelectorAll(INTERACTIVE)].filter((el) => !visuallyHidden(el)).map(hitTarget);
}

/**
 * Returns one entry per axis that fails.
 *
 * An axis the container determines (`width: 100%`, `height: 100%`, or any
 * block-level box) is skipped rather than guessed: a control at `width: 100%`
 * inside any real viewport is wider than 44px, and jsdom cannot resolve the
 * container without a layout engine. Every other axis must clear 44px on its
 * own declared or measured value.
 */
export function findUndersized(root: ParentNode): Undersized[] {
  const problems: Undersized[] = [];
  for (const el of interactiveControls(root)) {
    const m = measure(el);
    const who = describeControl(el);
    if (m.height !== null && m.height < MIN_TAP) {
      problems.push({ control: who, axis: 'height', actual: m.height, required: MIN_TAP });
    }
    if (!m.fillsWidth && (m.width ?? 0) < MIN_TAP) {
      problems.push({
        control: who,
        axis: 'width',
        actual: m.width,
        required: MIN_TAP,
      });
    }
  }
  return problems;
}