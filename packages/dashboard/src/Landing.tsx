/**
 * Marketing landing page.
 *
 * Repositioned in October 2026. The previous version led with "a vault for your
 * words" and a rotating list of adjectives, which positioned the product
 * against password managers while describing none of the things they cannot do.
 * That is a losing comparison on their turf: they have autofill, family plans,
 * and brand recognition, and the category they are in is being absorbed by
 * passkeys anyway.
 *
 * So the page argues the wedge instead:
 *
 *  - The problem section names the asymmetry (logins got solved, secrets did
 *    not) with sourced numbers, so a visitor can check the claim.
 *  - The comparison table is architectural, not a taste contest. It is the
 *    section that answers "why not Bitwarden or 1Password", and it is also the
 *    one most likely to offend a competitor, so it stays factual and carries a
 *    pricing disclaimer.
 *  - "What this is not" states the limits plainly. Losing a visitor who wanted
 *    browser autofill is cheaper than winning one who is disappointed in week
 *    two, and it is the fastest way to look credible on everything else.
 *
 * The visual system is the one in `index.css`: one warm charcoal ground, one
 * cream ground, one sand accent, and a system serif for display. The page
 * alternates grounds per section so a long read never becomes one unbroken dark
 * scroll, and the hero carries the three architecture facts as a translucent
 * stat strip rather than as prose, because a number set in the same type as the
 * headline is read as a promise and this product does not make promises it
 * cannot show.
 *
 * Static content only, so it never downloads the crypto engine or the vault.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Fingerprint,
  Github,
  KeyRound,
  Minus,
  Users,
  X,
} from 'lucide-react';


const GITHUB = 'https://github.com/Abelion512/lembaranz';
const REPO = 'https://github.com/Abelion512/lembaranz.git';
// Resolved against the origin so the same build works on localhost and Vercel.
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://lembaranz.vercel.app';
const INSTALL_CURL = `curl -fsSL ${SITE_URL}/install.sh | bash`;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '简体中文' },
];

// Nothing is published to the npm registry yet, so install from source.
const METHODS: Record<string, string> = {
  curl: INSTALL_CURL,
  npm: `git clone ${REPO} && cd lembaranz && npm i && npm i -g .`,
  bun: `git clone ${REPO} && cd lembaranz && bun i && bun link`,
};

/**
 * One icon per stat cell, positional. Icons are not translatable, so they stay
 * in code and the captions stay in the catalogue.
 */
const METRIC_ICONS = [Fingerprint, KeyRound, Users] as const;

// Apple HIG minimum hit target. Declared on both axes rather than arriving at
// 44px through text and padding, so the guarantee is visible to the
// touch-target suite and to the next edit that trims the padding.
const TAP = 'min-h-[44px] min-w-[44px]';

/** The wordmark glyph. The same shape as the favicon, inlined so it inherits `currentColor`. */
const Mark = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 6.6 12 3.2l8 3.4V13c0 4.1-3.3 6.8-8 7.9-4.7-1.1-8-3.8-8-7.9V6.6Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10.5" r="1.7" fill="currentColor" />
    <path d="M12 12.3v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Section heading block. `tone` picks the ground the section sits on. */
const SectionHead: React.FC<{
  eyebrow: string;
  title: string;
  lede?: string;
  tone: 'dark' | 'paper';
}> = ({ eyebrow, title, lede, tone }) => {
  const dark = tone === 'dark';
  return (
    <div data-reveal>
      <h2
        className={`font-display text-[2rem] leading-[1.1] text-balance md:text-[3.15rem] ${
          dark ? 'text-cream' : 'text-ink'
        }`}
      >
        {/* Inside the heading, not beside it. A short label element sitting
            directly above a heading is the most recognisable shape of a
            generated landing page; folding it in keeps the label, drops the
            shape, and a screen reader now announces the section as one title. */}
        <span className={`eyebrow font-sans mb-5 block ${dark ? 'text-sand' : 'text-sand-ink'}`}>{eyebrow}</span>
        {title}
      </h2>
      {lede && (
        <p className={`mt-6 max-w-2xl text-[17px] leading-relaxed ${dark ? 'text-muted' : 'text-ink/70'}`}>
          {lede}
        </p>
      )}
    </div>
  );
};

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const { t, i18n } = useTranslation();
  const [wordIndex, setWordIndex] = useState(0);
  const [method, setMethod] = useState<keyof typeof METHODS>('curl');
  const [copied, setCopied] = useState(false);

  const words = t('landing.hero.words', { returnObjects: true }) as unknown as string[];
  const chips = t('landing.hero.chips', { returnObjects: true }) as unknown as string[];
  const metrics = t('landing.hero.metrics', { returnObjects: true }) as unknown as {
    value: string;
    label: string;
  }[];
  const cards = t('landing.problem.cards', { returnObjects: true }) as unknown as { value: string; label: string; note: string }[];
  const holds = t('landing.holds.items', { returnObjects: true }) as unknown as { title: string; body: string }[];
  const compareRows = t('landing.compare.rows', { returnObjects: true }) as unknown as { feature: string; them: string; proton: string; us: string }[];
  const notThis = t('landing.notThis.items', { returnObjects: true }) as unknown as string[];
  const guarantees = t('landing.security.guarantees', { returnObjects: true }) as unknown as string[];
  const pipeline = t('landing.security.pipeline', { returnObjects: true }) as unknown as { step: string; title: string; note: string }[];
  const roadmap = t('landing.roadmap.steps', { returnObjects: true }) as unknown as { title: string; body: string }[];
  const faq = t('landing.faq.items', { returnObjects: true }) as unknown as { q: string; a: string }[];

  const nav = [
    { href: '#problem', label: t('landing.nav.problem') },
    { href: '#holds', label: t('landing.nav.holds') },
    { href: '#compare', label: t('landing.nav.compare') },
    { href: '#install', label: t('landing.nav.install') },
    { href: '#faq', label: t('landing.nav.faq') },
  ];

  const activeLang = i18n.resolvedLanguage?.startsWith('zh') ? 'zh' : 'en';

  useEffect(() => {
    const id = window.setInterval(() => setWordIndex((i) => (i + 1) % words.length), 3600);
    return () => window.clearInterval(id);
  }, [words.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('fade-up');
        }
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const copyInstall = (text: string) => {
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <a
        href="#problem"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:inline-flex focus:items-center focus:min-h-[44px] focus:px-4 focus:rounded-full focus:bg-sand focus:text-ink focus:text-sm"
      >
        {t('landing.skip')}
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <button
            onClick={onEnter}
            className={`${TAP} flex items-center gap-2.5 font-display text-[17px] tracking-wide text-cream`}
            aria-label={t('landing.nav.openDashboard')}
          >
            <Mark className="h-[18px] w-[18px] text-sand" />
            Lembaranz
          </button>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={`${TAP} inline-flex items-center text-[13px] font-medium transition-colors ${
                  index === 0 ? 'text-sand' : 'text-muted hover:text-cream'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-4 sm:flex" role="group" aria-label={t('landing.langLabel')}>
              {LANGS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => void i18n.changeLanguage(lang.code)}
                  className={`${TAP} text-[13px] font-medium transition-colors ${
                    activeLang === lang.code ? 'text-sand' : 'text-faint hover:text-cream'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={onEnter}
              className={`btn btn-ghost px-5 text-[13px] text-sand`}
            >
              {t('landing.nav.openDashboard')}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero: the asymmetry, stated as a claim a reader can check. */}
      <section className="hero-field relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[2.4rem] leading-[1.06] text-cream sm:text-[3rem] lg:text-[3.5rem]">
              {t('landing.hero.lead')}{' '}
              <span className="text-sand">{words[wordIndex % words.length]}</span>
              <br />
              {t('landing.hero.title')}
            </h1>

            <span className="display-rule mt-9" />

            <p className="mt-9 max-w-xl text-[17px] leading-relaxed text-muted md:text-lg">
              {t('landing.hero.subtitle')}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button onClick={onEnter} className="btn btn-sand px-7">
                {t('landing.hero.openDashboard')}
                <ArrowRight size={16} />
              </button>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {t('landing.hero.viewSource')}
                <ArrowDown size={16} className="-rotate-90" />
              </a>
            </div>
          </div>

          {/* Translucent card over the field, in the reference layout: tags
              first, then the claim they support. */}
          <aside className="lg:col-span-5 lg:pt-10">
            <div className="glass rounded-2xl p-7 shadow-lift lg:p-8" data-reveal>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                  </span>
                ))}
              </div>
              <h2 className="font-display mt-6 text-[1.6rem] leading-tight text-cream">{t('landing.hero.tagTitle')}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('landing.hero.tagBody')}</p>
            </div>
          </aside>
        </div>

        {/* Three architecture facts as a translucent stat strip along the foot
            of the field. A number set in the same type as the headline reads as
            a claim, so these are the three the vault itself can show, and they
            sit over the hero rather than below it so the fold is never a seam. */}
        <div className="mx-auto mt-14 max-w-6xl px-5 md:mt-20">
          <dl className="glass grid divide-y divide-line overflow-hidden rounded-2xl shadow-lift sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {metrics.map((metric, index) => {
              const Icon = METRIC_ICONS[index] ?? Fingerprint;
              return (
                <div key={metric.value} className="flex gap-4 px-7 py-6">
                  <Icon size={18} className="mt-1 shrink-0 text-sand" />
                  <div>
                    <dt className="font-display text-[1.65rem] leading-none text-cream">{metric.value}</dt>
                    <dd className="mt-2 text-[13px] leading-relaxed text-faint">{metric.label}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Problem: numbers first, so the positioning is falsifiable. */}
      <section id="problem" className="paper-field scroll-mt-20 pt-24 md:pt-28">
        <div className="mx-auto max-w-6xl px-5 pb-24">
          <SectionHead
            tone="paper"
            eyebrow={t('landing.problem.eyebrow')}
            title={t('landing.problem.title')}
            lede={t('landing.problem.lede')}
          />

          <dl className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.value} className="border-t border-ink/20 pt-6" data-reveal>
                <dt className="font-display text-[3rem] leading-none text-ink">{card.value}</dt>
                <dd className="mt-4">
                  <div className="text-[15px] font-medium text-ink">{card.label}</div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{card.note}</p>
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-16 max-w-3xl text-[17px] leading-relaxed text-ink/70">{t('landing.problem.close')}</p>
        </div>
      </section>

      {/* What it holds: the four cases a login form cannot express. */}
      <section id="holds" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
          <SectionHead tone="dark" eyebrow={t('landing.holds.eyebrow')} title={t('landing.holds.title')} />

          <div className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
            {holds.map((item, index) => (
              <div key={item.title} className="border-t border-line pt-6" data-reveal>
                <h3 className="font-display text-[1.5rem] leading-snug text-cream">
                  <span className="mb-4 block text-sm text-sand tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: the section that answers "why not Bitwarden or 1Password". */}
      <section id="compare" className="paper-field scroll-mt-20 border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
          <SectionHead
            tone="paper"
            eyebrow={t('landing.compare.eyebrow')}
            title={t('landing.compare.title')}
            lede={t('landing.compare.lede')}
          />

          <div className="mt-14 overflow-x-auto" data-reveal>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/25">
                  <th scope="col" className="w-1/5 py-4 pr-6 text-[12px] font-medium tracking-[0.04em] text-ink/60">
                    {t('landing.compare.columns.0')}
                  </th>
                  {['landing.compare.columns.1', 'landing.compare.columns.2', 'landing.compare.columns.3'].map((key) => (
                    <th key={key} scope="col" className="py-4 pr-6 text-[12px] font-medium tracking-[0.04em] text-ink/60">
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.feature} className="border-b border-ink/15 align-top">
                    <th scope="row" className="py-5 pr-6 font-medium text-ink">
                      {row.feature}
                    </th>
                    <td className="py-5 pr-6 text-ink/60">{row.them}</td>
                    <td className="py-5 pr-6 text-ink/60">{row.proton}</td>
                    <td className="py-5 pr-6">
                      <span className="inline-flex gap-2 text-ink">
                        {row.them === 'No.' && <X size={14} className="mt-1 shrink-0 text-ink/30" />}
                        {row.us === 'Yes. It is a CLI first.' && <Check size={14} className="mt-1 shrink-0 text-sand-ink" />}
                        <span>{row.us}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-ink/65">{t('landing.compare.footnote')}</p>
        </div>
      </section>

      {/* Honest limits. Losing the wrong visitor early beats disappointing them later. */}
      <section className="paper-field border-t border-ink/10">
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-4 md:pb-32">
          <SectionHead tone="paper" eyebrow={t('landing.notThis.eyebrow')} title={t('landing.notThis.title')} />

          <ul className="mt-14 space-y-7">
            {notThis.map((item) => (
              <li key={item} className="flex gap-4 border-b border-ink/15 pb-7 text-[15px] leading-relaxed" data-reveal>
                <Minus size={16} className="mt-1 shrink-0 text-sand-ink" />
                <span className="text-ink/80">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-[17px] leading-relaxed text-ink/70">{t('landing.notThis.close')}</p>
        </div>
      </section>

      {/* Security: how an entry is protected, in four steps. */}
      <section id="security" className="hero-field scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
          <SectionHead
            tone="dark"
            eyebrow={t('landing.security.eyebrow')}
            title={t('landing.security.title')}
            lede={t('landing.security.subtitle')}
          />

          <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              {/* A sentence, so it gets a real subheading rather than the
                  11px tracked label the shorter eyebrows use. */}
              <h3 className="font-display text-[1.35rem] leading-snug text-cream">{t('landing.security.pipelineTitle')}</h3>
              <ol className="mt-6 divide-y divide-line border-y border-line">
                {pipeline.map((item) => (
                  <li key={item.step} className="flex gap-6 py-6">
                    <span className="font-mono text-xs text-sand tabular-nums">{item.step}</span>
                    <div>
                      <div className="font-display text-[1.25rem] text-cream">{item.title}</div>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ul className="space-y-5 self-start">
              {guarantees.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-line pb-5 text-[15px] text-muted">
                  <Check size={16} className="mt-1 shrink-0 text-sand" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Install: one command, then a server that prints its own connect link. */}
      <section id="install" className="scroll-mt-20 border-t border-line bg-ink">
        <div className="mx-auto max-w-3xl px-5 py-24 md:py-32">
          <SectionHead
            tone="dark"
            eyebrow={t('landing.hero.installLine')}
            title={t('landing.install.title')}
            lede={t('landing.install.subtitle')}
          />

          {/* One surface, not a card inside a card: the method row and the
              command are two rows of the same block, separated by a hairline,
              with no tinted panel behind the command. */}
          <div className="mt-12 border-y border-line" data-reveal>
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-2" role="group" aria-label={t('landing.install.title')}>
                {/* An underline, not a filled pill. A background on the active
                    option reads as a card sitting inside the block, which is
                    what opencode.ai avoids by letting each command be its own
                    copyable row. Colour and a rule carry the state instead, so
                    the row stays one surface. */}
                {Object.keys(METHODS).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m as keyof typeof METHODS)}
                    aria-pressed={method === m}
                    className={`${TAP} border-b-2 px-3 text-xs tracking-wide transition-colors ${
                      method === m ? 'border-sand text-sand' : 'border-transparent text-faint hover:text-muted'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => copyInstall(METHODS[method])} className={`btn btn-quiet px-3 text-xs`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('landing.install.copied') : t('common.copy')}
              </button>
            </div>
            <div className="border-t border-line py-6 font-mono text-xs leading-relaxed break-all text-muted sm:text-sm">
              <span className="select-none text-sand">$ </span>
              {METHODS[method]}
            </div>
          </div>

          <p className="mt-8 text-[15px] leading-relaxed text-muted">
            <span className="font-medium text-cream">
              2. {t('landing.install.step2Title')}.{' '}
            </span>
            {t('landing.install.step2Body')}
          </p>

          <p className="mt-8 text-[15px] text-muted">
            {t('landing.install.noInstall')}{' '}
            <button onClick={onEnter} className={`${TAP} font-medium text-sand hover:text-sand-deep`}>
              {t('landing.install.openInBrowser')}
            </button>
          </p>
        </div>
      </section>

      {/* Roadmap: why a local vault is a wedge rather than a niche. */}
      <section className="paper-field border-t border-ink/10">
        <div className="mx-auto max-w-3xl px-5 py-24 md:py-32">
          <SectionHead
            tone="paper"
            eyebrow={t('landing.roadmap.eyebrow')}
            title={t('landing.roadmap.title')}
            lede={t('landing.roadmap.lede')}
          />

          <ol className="mt-14 divide-y divide-ink/15 border-y border-ink/15">
            {roadmap.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3 py-8 sm:flex-row sm:gap-8" data-reveal>
                <span className="font-display shrink-0 text-sm text-sand-ink tabular-nums sm:w-16 sm:pt-2">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-[1.4rem] leading-snug text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-[17px] leading-relaxed text-ink/70">{t('landing.roadmap.close')}</p>
        </div>
      </section>

      <section id="faq" className="paper-field scroll-mt-20 border-t border-ink/10">
        <div className="mx-auto max-w-3xl px-5 pb-24 md:pb-32">
          <SectionHead tone="paper" eyebrow="FAQ" title={t('landing.faq.title')} />

          <div className="mt-14 divide-y divide-ink/15 border-y border-ink/15">
            {faq.map((item) => (
              <details key={item.q} className="group py-6">
                <summary
                  className={`${TAP} flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.2rem] text-ink [&::-webkit-details-marker]:hidden`}
                >
                  {item.q}
                  <span className="text-lg leading-none text-sand-ink transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[15px] leading-relaxed text-ink/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="abyss-field border-t border-line">
        <div className="mx-auto max-w-4xl px-5 py-28 text-center md:py-36">
          <h2 className="font-display mx-auto max-w-3xl text-[2.2rem] leading-[1.08] text-cream text-balance md:text-[3.5rem]">
            {t('landing.cta.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted">{t('landing.cta.subtitle')}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button onClick={onEnter} className="btn btn-sand px-7">
              {t('landing.cta.openDashboard')}
              <ArrowRight size={16} />
            </button>
            <button onClick={() => copyInstall(INSTALL_CURL)} className="btn btn-ghost">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t('landing.cta.copied') : t('landing.cta.copyInstall')}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-5 py-12">
          {/* One centred cluster. The left/right split only made sense while a
              brand block sat on the left; with a single row left it stranded
              the copyright at one edge and nothing at the other. */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12px] text-faint">
            <span>{t('landing.footer.rights')}</span>
            {/* `text-faint` is repeated on each link rather than left to the
                parent. An unstyled anchor does not inherit its colour: the
                user agent's `:link { color: #0000ee }` wins over an inherited
                value, so these three were rendering browser blue on the
                charcoal footer at 1.97:1. */}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={`${TAP} inline-flex items-center gap-1.5 text-faint hover:text-sand`}>
              <Github size={13} /> {t('landing.nav.github')}
            </a>
            <a
              href={`${GITHUB}/blob/main/PRIVACY.md`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TAP} inline-flex items-center text-faint hover:text-sand`}
            >
              {t('landing.footer.privacy')}
            </a>
            <a
              href={`${GITHUB}/blob/main/SECURITY.md`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TAP} inline-flex items-center text-faint hover:text-sand`}
            >
              {t('landing.footer.security')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}