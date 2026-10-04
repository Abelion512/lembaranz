/**
 * Connect screen.
 *
 * This is the fallback path. `lembaranz server` prints a link carrying the
 * origin and token in the URL fragment, and `consumeConnectLink()` in `App.tsx`
 * picks that up, so on the normal route a user never sees this screen at all.
 * It stays for the cases where the link was not used: opening `/app` directly,
 * an older build, or a server on a different address than the one stored.
 *
 * Keeping it is cheaper than removing it, because the manual path is also the
 * documented recovery path when someone's browser refuses the fragment.
 *
 * The screen carries exactly three interactive controls: the two fields and the
 * submit button. That is not an accident of the markup, the touch-target suite
 * asserts the count, so adding a "back to the landing page" link here is a test
 * failure rather than a one-line edit.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Terminal } from 'lucide-react';
import { api, saveConnection, baseUrl, token as savedToken } from './api';

export const ConnectScreen: React.FC<{ onConnected: () => void }> = ({ onConnected }) => {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState(baseUrl());
  const [token, setToken] = useState(savedToken());
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    saveConnection(origin, token.trim());

    if (await api.health()) {
      onConnected();
      return;
    }
    // health() is unauthenticated, so a reachable server that still fails here
    // means the token is wrong. Verify with a real call before declaring success.
    const res = await api.status();
    setChecking(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onConnected();
  };

  return (
    <div className="hero-field flex min-h-screen w-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-lift">
          <div className="mb-8 flex flex-col items-center text-center">
            <Terminal size={30} className="text-sand" />
            <h1 className="font-display mt-5 text-[1.75rem] leading-tight text-cream">{t('lock.connect')}</h1>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">{t('lock.notConnectedHint')}</p>
          </div>

          <form onSubmit={connect} className="space-y-5">
            {error && (
              <div role="alert" className="rounded-xl border border-alert/35 bg-alert/10 p-3 text-sm leading-relaxed text-alert">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="origin" className="eyebrow block text-faint">
                Origin
              </label>
              <input
                id="origin"
                type="url"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="http://127.0.0.1:5121"
                autoComplete="off"
                className="w-full min-h-[44px] rounded-xl border border-line bg-ink-soft px-4 py-3 font-mono text-sm text-cream placeholder:text-faint focus:border-sand"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="token" className="eyebrow block text-faint">
                Token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t('lock.connect')}
                autoComplete="off"
                className="w-full min-h-[44px] rounded-xl border border-line bg-ink-soft px-4 py-3 text-sm tracking-widest text-cream placeholder:text-faint focus:border-sand"
              />
            </div>

            <button
              type="submit"
              disabled={checking}
              className="btn btn-sand w-full disabled:opacity-60"
            >
              <Shield size={16} />
              {checking ? `${t('lock.unlocking')}...` : t('lock.connect')}
            </button>
          </form>

          <p className="mt-7 border-t border-line pt-5 text-[12px] leading-relaxed text-faint">
            {t('vault.sessionOnly')}
          </p>
        </div>
      </div>
    </div>
  );
};