/**
 * Test setup for the dashboard.
 *
 * Two things have to be true before any component test is meaningful:
 *
 *  1. i18next is initialised with the real catalogues. Without this, `t('lock.title')`
 *     returns the key, so a test can pass while the screen shows a raw string.
 *  2. The language is pinned to English. The app uses a browser language
 *     detector, and a headless runner's locale decides the outcome otherwise,
 *     which is a test that passes on one machine and fails on another.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import i18n from '../i18n';

await i18n.changeLanguage('en');

/**
 * jsdom does not implement `IntersectionObserver`, which the landing page uses
 * for scroll reveals. Every browser that can run this build has had it for
 * years, so a stub restores parity rather than hiding a defect. It reports
 * nothing intersecting, so the reveal class is simply never added, which is
 * what a viewport above the fold would do for most of the page anyway.
 */
if (!('IntersectionObserver' in globalThis)) {
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: readonly number[] = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = StubIntersectionObserver as unknown as typeof IntersectionObserver;
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});