import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Merged onto the app's own Vite config rather than replacing it, so the React
// plugin, the `process.env` shim and any future app-level resolve rules stay
// identical between `vite build` and `vitest`. A test that renders under
// different conditions than the product builds under is worth very little.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      include: ['src/__tests__/**/*.test.{ts,tsx}'],
      // The touch-target suite compiles the real Tailwind stylesheet and runs
      // the CSS cascade in jsdom, which is slower than a plain render.
      testTimeout: 30_000,
      hookTimeout: 60_000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/__tests__/**', 'src/main.tsx'],
        thresholds: {
          // Floors, not goals. Set at the measured value on the day they were
          // introduced so CI fails on a regression and passes on today. Measured
          // 84.08% line coverage at the time this was written.
          // Phase 3 raises this as component coverage lands.
          lines: 84,
        },
      },
    },
  })
);