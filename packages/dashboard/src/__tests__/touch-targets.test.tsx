/**
 * Touch targets: every interactive control must resolve to at least 44x44px.
 *
 * Rule 8 says the size is verified against rendered markup, not source. So this
 * does not grep the components for `min-h-[44px]`. It compiles the project's
 * real Tailwind stylesheet, injects it into jsdom, renders each screen for real
 * through Testing Library, and then asks the CSS cascade what box the browser
 * would give each control.
 *
 * Every screen is covered, not just the marketing page: a 32px icon button on
 * the integrity tab is as much a defect as a small link in the hero. Each
 * screen is listed by name in the test titles so a failure names the surface.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { installTailwind } from './helpers/css';
import { findUndersized, interactiveControls, type Undersized } from './helpers/touch';
import Landing from '../Landing';
import App from '../App';
import { ConnectScreen } from '../ConnectScreen';
import { LockScreen } from '../LockScreen';
import { saveConnection } from '../api';

const RECOVERY_PHRASE =
  'legal winner thank year wave sausage worth useful legal winner thank yellow';

const NOTE = {
  id: 'note-1',
  title: 'Production API key',
  content: 'sk-live-0123456789',
  preview: 'sk-live-...',
  tags: ['prod', 'billing'],
  updatedAt: '2026-10-01T12:00:00.000Z',
};

/**
 * Routes every client call to a canned payload. The dashboard only ever calls
 * the vault server, so a path table is enough and keeps each screen's fixture
 * readable next to the assertions.
 */
function mockServer(routes: Record<string, unknown>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const method = init?.method ?? 'GET';
      const key = `${method} ${url.pathname}`;
      if (!(key in routes)) {
        return new Response(JSON.stringify({ error: `unmocked ${key}`, code: 'unreachable' }), { status: 404 });
      }
      return new Response(JSON.stringify({ data: routes[key] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
}

const connectedRoutes = {
  'POST /status': { setup: true, locked: false },
  // `listNotes` is a GET; `saveNote` and `deleteNote` share the POST/DELETE path.
  'GET /notes': [NOTE],
  'POST /notes': NOTE,
  'POST /note': NOTE,
  'POST /audit': {
    chain: { ok: true, checked: 3, legacy: 0 },
    entries: [
      { id: 'e1', timestamp: '2026-10-01T12:00:00.000Z', action: 'VAULT_UNLOCKED', details: 'session opened' },
    ],
  },
};

/** Formats violations so a failure names the control and the number. */
const report = (problems: Undersized[]): string =>
  problems
    .map((p) => `  ${p.axis} ${p.actual ?? 'unmeasurable'}px < ${p.required}px  ${p.control}`)
    .join('\n');

/** Renders `ui`, asserts nothing is undersized, and returns how many were checked. */
async function assertEveryControlIsTappable(ui: React.ReactElement, surface: string): Promise<number> {
  const { container, unmount } = render(ui);
  await waitFor(() => {
    expect(interactiveControls(container).length).toBeGreaterThan(0);
  });
  const problems = findUndersized(container);
  expect(problems, `${surface} has undersized controls:\n${report(problems)}`).toEqual([]);
  const count = interactiveControls(container).length;
  unmount();
  return count;
}

beforeAll(async () => {
  await installTailwind();
});

describe('every interactive control resolves to at least 44x44px', () => {
  it('Landing: nav, language switch, calls to action, install tabs, footer', async () => {
    const count = await assertEveryControlIsTappable(<Landing onEnter={() => {}} />, 'Landing');
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('ConnectScreen: origin and token fields plus the connect button', async () => {
    const count = await assertEveryControlIsTappable(<ConnectScreen onConnected={() => {}} />, 'ConnectScreen');
    expect(count).toBe(3);
  });

  it('LockScreen: unlock, with the recovery and change-connection paths visible', async () => {
    saveConnection('http://127.0.0.1:5121', 'test-token');
    mockServer({ 'POST /recovery-phrase': RECOVERY_PHRASE });
    const count = await assertEveryControlIsTappable(
      <LockScreen hasVault onUnlocked={() => {}} onDisconnect={() => {}} />,
      'LockScreen (unlock)'
    );
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it('LockScreen: create, including the recovery phrase grid and its confirmation', async () => {
    saveConnection('http://127.0.0.1:5121', 'test-token');
    mockServer({ 'POST /recovery-phrase': RECOVERY_PHRASE });
    const count = await assertEveryControlIsTappable(
      <LockScreen hasVault={false} onUnlocked={() => {}} onDisconnect={() => {}} />,
      'LockScreen (create)'
    );
    expect(count).toBeGreaterThanOrEqual(6);
  });

  it('LockScreen: recover, reached the way a user reaches it', async () => {
    saveConnection('http://127.0.0.1:5121', 'test-token');
    mockServer({ 'POST /recovery-phrase': RECOVERY_PHRASE });
    const user = userEvent.setup();
    const { container } = render(
      <LockScreen hasVault onUnlocked={() => {}} onDisconnect={() => {}} />
    );
    // Drive it to the recover mode rather than rendering a prop that does not
    // exist, so what gets measured is the screen a locked-out user sees.
    await user.click(await screen.findByRole('button', { name: /recovery/i }));
    await screen.findByRole('textbox');

    const problems = findUndersized(container);
    expect(problems, `LockScreen (recover) has undersized controls:\n${report(problems)}`).toEqual([]);
  });

  it('LockScreen: not connected, the branch a user hits with no server running', async () => {
    sessionStorage.clear();
    const count = await assertEveryControlIsTappable(
      <LockScreen hasVault={null} onUnlocked={() => {}} onDisconnect={() => {}} />,
      'LockScreen (not connected)'
    );
    expect(count).toBe(1);
  });

  it('Vault entries: search, new entry, the entry row, and the editor toolbar', async () => {
    saveConnection('http://127.0.0.1:5121', 'test-token');
    mockServer(connectedRoutes);
    const user = userEvent.setup();
    const { container } = render(<App />);
    // Open the entry so the copy and delete controls are on screen: those only
    // render once a note is active, and an icon button is exactly the kind of
    // control that ends up at 28px.
    await user.click(await screen.findByRole('button', { name: /production api key/i }));
    await screen.findByDisplayValue('sk-live-0123456789');

    const problems = findUndersized(container);
    expect(problems, `Vault entries has undersized controls:\n${report(problems)}`).toEqual([]);
  });

  it('Vault integrity: the chain status and the re-verify control', async () => {
    saveConnection('http://127.0.0.1:5121', 'test-token');
    mockServer(connectedRoutes);
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.click(await screen.findByRole('tab', { name: /integrity/i }));
    await screen.findByRole('button', { name: /verify/i });

    const problems = findUndersized(container);
    expect(problems, `Vault integrity has undersized controls:\n${report(problems)}`).toEqual([]);
  });
});