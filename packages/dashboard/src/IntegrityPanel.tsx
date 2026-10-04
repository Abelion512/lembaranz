/**
 * Integrity panel.
 *
 * Replaces the "Env Manager" tab that shipped with two dead buttons: "Save New
 * .env Project" only showed a success toast without saving anything, and the
 * "Saved Env Profiles" list was a hardcoded `lembaranz-core` card. On a product
 * whose entire pitch is "trust us with your secrets", a screen that lies about
 * having stored your secrets is the most expensive possible bug, so it is gone.
 *
 * What is here instead is checkable: the per-entry SHA-256 seals and the
 * hash-chained audit ledger, verified live from the server. The old landing page
 * claimed tamper evidence in prose; this is the screen that backs it up, and it
 * doubles as the strongest answer to "why not just use Bitwarden", since a
 * closed vendor cannot show you this.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Fingerprint, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { api } from './api';

interface AuditState {
  ok: boolean;
  checked: number;
  legacy: number;
  brokenAt?: string;
  entries: { id: string; timestamp: string; action: string; details: string }[];
}

const TAP_TARGET = 'min-h-[44px] min-w-[44px]';

export const IntegrityPanel: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<AuditState | null>(null);
  const [checking, setChecking] = useState(true);

  const verify = useCallback(async () => {
    setChecking(true);
    const res = await api.audit();
    // A locked vault or a stopped server leaves this empty rather than showing a
    // red "broken" chain, which would be a lie in the other direction.
    if (res.data) {
      setState({ ...res.data.chain, entries: res.data.entries.slice(-12).reverse() });
    } else {
      setState(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    void verify();
  }, [verify]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-12 px-6 py-12">
        <header>
          <h2 className="font-display text-[2rem] leading-tight text-cream">{t('vault.integrity')}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('vault.integritySubtitle')}</p>
        </header>

        <section className="space-y-4">
          {state ? (
            <>
              <div
                role="status"
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  state.ok ? 'border-sage/35 bg-sage/10' : 'border-alert/35 bg-alert/10'
                }`}
              >
                {state.ok ? (
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sage" />
                ) : (
                  <XCircle size={20} className="mt-0.5 shrink-0 text-alert" />
                )}
                <div>
                  <div className={state.ok ? 'font-medium text-sage' : 'font-medium text-alert'}>
                    {state.ok ? t('vault.chainOk') : `${t('vault.chainBroken')} ${state.brokenAt ?? ''}`}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {state.checked} {t('vault.chainChecked')}
                    {state.legacy > 0 && ` · ${state.legacy} ${t('vault.chainLegacy')}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void verify()}
                disabled={checking}
                className={`${TAP_TARGET} inline-flex items-center gap-2 rounded-full border border-line px-5 text-sm text-muted transition-colors hover:border-sand/60 hover:text-sand disabled:opacity-60`}
              >
                <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                {t('vault.verify')}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-line p-4 text-sm text-muted">
              {checking ? `${t('vault.verify')}...` : t('vault.noActions')}
            </div>
          )}
        </section>

        {state && state.entries.length > 0 && (
          <section className="space-y-3">
            <h3 className="eyebrow text-faint">{t('vault.recentActions')}</h3>
            <ul className="divide-y divide-line border-y border-line">
              {state.entries.map((entry) => (
                <li key={entry.id} className="flex items-baseline gap-4 py-3">
                  <span className="shrink-0 font-mono text-xs text-faint tabular-nums">
                    {entry.timestamp.replace('T', ' ').slice(0, 19)}
                  </span>
                  <span className="w-36 shrink-0 truncate text-sm text-sand">{entry.action}</span>
                  <span className="truncate text-sm text-muted">{entry.details}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-line bg-ink-soft p-5">
          <h3 className="flex items-center gap-2 font-display text-[1.15rem] text-cream">
            <Fingerprint size={16} className="text-sand" />
            {t('vault.crypto')}
          </h3>
        </section>

        <section className="space-y-3 rounded-xl border border-alert/30 bg-alert/10 p-5">
          <h3 className="flex items-center gap-2 font-display text-[1.15rem] text-alert">
            <ShieldAlert size={16} />
            {t('vault.panicTitle')}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{t('vault.panicBody')}</p>
        </section>
      </div>
    </div>
  );
};