import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronRight,
  Copy,
  Github,
  Lock,
  Plus,
  ShieldCheck,
} from 'lucide-react';

const VERSION = 'v0.2.0';
const GITHUB = 'https://github.com/Abelion512/lembaranz';
const REPO = 'https://github.com/Abelion512/lembaranz.git';
// Web split (local vs Vercel): the install URL points at the site actually
// serving this page. Local dev (`bun run dev`) serves install.sh from the
// origin too, so curl-ing it works without touching Vercel.
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://lembaranz.vercel.app';
const INSTALL_CURL = `curl -fsSL ${SITE_URL}/install.sh | bash`;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '简体中文' },
];

// Nothing is published to the npm registry yet, so npm/bun install from source.
const METHODS: Record<string, string> = {
  curl: INSTALL_CURL,
  npm: `git clone ${REPO} && cd lembaranz && npm i && npm i -g .`,
  bun: `git clone ${REPO} && cd lembaranz && bun i && bun link`,
};

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const { t, i18n } = useTranslation();
  const [wordIndex, setWordIndex] = useState(0);
  const [method, setMethod] = useState<keyof typeof METHODS>('curl');
  const [copied, setCopied] = useState(false);

  const words = t('landing.hero.words', { returnObjects: true }) as unknown as string[];
  const features = t('landing.features.items', { returnObjects: true }) as unknown as { title: string; body: string }[];
  const guarantees = t('landing.security.guarantees', { returnObjects: true }) as unknown as string[];
  const pipeline = t('landing.security.pipeline', { returnObjects: true }) as unknown as { step: string; title: string; note: string }[];
  const faq = t('landing.faq.items', { returnObjects: true }) as unknown as { q: string; a: string }[];

  const nav = [
    { href: '#features', label: t('landing.nav.features') },
    { href: '#security', label: t('landing.nav.security') },
    { href: '#install', label: t('landing.nav.install') },
    { href: '#faq', label: t('landing.nav.faq') },
  ];

  const activeLang = i18n.resolvedLanguage?.startsWith('zh') ? 'zh' : 'en';

  useEffect(() => {
    const id = window.setInterval(() => setWordIndex(i => (i + 1) % words.length), 3200);
    return () => window.clearInterval(id);
  }, [words.length]);

  const copyInstall = () => {
    navigator.clipboard?.writeText(INSTALL_CURL).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#0071e3] focus:text-white focus:text-sm"
      >
        {t('landing.skip')}
      </a>

      {/* Global nav: translucent black, hairline, 48px */}
      <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
          <button onClick={onEnter} className="flex items-center gap-2 text-sm font-semibold" aria-label={t('landing.nav.openDashboard')}>
            <Lock size={14} className="text-white" />
            Lembaranz
          </button>
          <nav className="hidden md:flex items-center gap-8 text-xs text-[#a1a1a6]" aria-label="Primary">
            {nav.map(item => (
              <a key={item.href} href={item.href} className="hover:text-white transition-colors">{item.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs" role="group" aria-label={t('landing.langLabel')}>
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => void i18n.changeLanguage(lang.code)}
                  className={`h-8 px-1 transition-colors ${activeLang === lang.code ? 'text-white underline underline-offset-4' : 'text-[#a1a1a6] hover:text-white'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button onClick={onEnter} className="btn-primary h-9 px-4 text-xs font-medium">
              {t('landing.nav.openDashboard')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero: giant statement typography, left-aligned */}
      <section className="pt-40 pb-24 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-medium text-[#2997ff] mb-5">{VERSION} · {t('landing.hero.badge')}</p>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-7 text-balance">
            {t('landing.hero.titleLead')}{' '}
            <span className="text-[#a1a1a6]">{words[wordIndex % words.length]}</span>
          </h1>
          <p className="text-lg md:text-xl text-[#a1a1a6] max-w-2xl leading-relaxed mb-10">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-6 mb-10">
            <button onClick={onEnter} className="btn-primary h-12 px-6 text-base font-medium flex items-center gap-1.5">
              {t('landing.hero.openDashboard')}
              <ChevronRight size={16} />
            </button>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-secondary h-12 px-2 text-base font-medium flex items-center gap-1.5">
              {t('landing.hero.viewSource')} <ChevronRight size={16} />
            </a>
          </div>
          <button
            onClick={copyInstall}
            className="group flex min-h-[44px] items-center gap-3 font-mono text-sm text-[#a1a1a6] hover:text-white transition-colors"
            title={t('landing.hero.copyHint')}
          >
            <span className="text-[#6e6e73] select-none">$</span>
            <span className="truncate">curl -fsSL {SITE_URL.replace(/^https?:\/\//, '')}/install.sh | bash</span>
            {copied ? <Check size={14} className="text-[#2997ff]" /> : <Copy size={14} className="opacity-40 group-hover:opacity-80" />}
          </button>
        </div>
      </section>

      {/* Value line: single sentence, Apple keynote style */}
      <section className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-balance">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-[#a1a1a6] max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
        </div>
      </section>

      {/* Features: typographic list, no card grid */}
      <section id="features" className="max-w-5xl mx-auto px-5 pb-24 scroll-mt-16">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          {features.map((feature, index) => (
            <div key={feature.title}>
              <div className="text-[#2997ff] font-semibold text-sm mb-2">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-[15px] text-[#a1a1a6] leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security: statement + two-column detail */}
      <section id="security" className="border-t border-white/10 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-balance">
            {t('landing.security.title')}
          </h2>
          <p className="text-lg text-[#a1a1a6] max-w-2xl mb-14">{t('landing.security.subtitle')}</p>

          <div className="grid lg:grid-cols-2 gap-14">
            <div>
              <ol className="divide-y divide-white/10 border-y border-white/10">
                {pipeline.map(item => (
                  <li key={item.step} className="py-5 flex gap-5">
                    <span className="font-mono text-xs text-[#6e6e73] pt-1">{item.step}</span>
                    <div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <p className="text-sm text-[#a1a1a6] leading-relaxed">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ul className="space-y-4">
              {guarantees.map(item => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-[#d6d6db]">
                  <ShieldCheck size={16} className="text-[#2997ff] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="border-t border-white/10 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">{t('landing.install.title')}</h2>
          <p className="text-lg text-[#a1a1a6] mb-10">{t('landing.install.subtitle')}</p>

          <div className="surface rounded-2xl overflow-hidden max-w-3xl">
            <div className="flex items-center justify-between px-5 h-12 border-b border-white/10">
              <div className="flex gap-5 text-sm">
                {Object.keys(METHODS).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m as keyof typeof METHODS)}
                    className={`h-11 transition-colors ${method === m ? 'text-white' : 'text-[#6e6e73] hover:text-[#a1a1a6]'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { navigator.clipboard?.writeText(METHODS[method]).catch(() => {}); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }}
                className="btn-secondary text-xs font-medium"
              >
                {copied ? t('landing.install.copied') : t('landing.install.copy')}
              </button>
            </div>
            <div className="p-5 font-mono text-sm text-[#a1a1a6] break-all leading-relaxed">
              <span className="text-[#6e6e73] select-none">$ </span>{METHODS[method]}
            </div>
          </div>

          <p className="text-sm text-[#a1a1a6] mt-8">
            {t('landing.install.noInstall')}{' '}
            <button onClick={onEnter} className="link font-medium">{t('landing.install.openInBrowser')}</button>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-5 py-24">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-12">{t('landing.faq.title')}</h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faq.map(item => (
              <details key={item.q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-semibold">
                  {item.q}
                  <Plus size={16} className="shrink-0 text-[#6e6e73] transition-transform group-open:rotate-45" />
                </summary>
                <p className="text-[15px] text-[#a1a1a6] leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-28 text-center">
          <h2 className="text-3xl md:text-6xl font-semibold tracking-tight mb-5 text-balance">{t('landing.cta.title')}</h2>
          <p className="text-lg text-[#a1a1a6] max-w-xl mx-auto mb-10">{t('landing.cta.subtitle')}</p>
          <button onClick={onEnter} className="btn-primary h-12 px-7 text-base font-medium inline-flex items-center gap-1.5">
            {t('landing.cta.openDashboard')}
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-5 py-10 text-xs text-[#6e6e73] space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {nav.map(item => (
              <a key={item.href} href={item.href} className="hover:text-[#a1a1a6]">{item.label}</a>
            ))}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-[#a1a1a6] flex items-center gap-1">
              <Github size={11} /> {t('landing.nav.github')}
            </a>
            <a href={`${GITHUB}/blob/main/PRIVACY.md`} target="_blank" rel="noopener noreferrer" className="hover:text-[#a1a1a6]">{t('landing.footer.privacy')}</a>
            <a href={`${GITHUB}/blob/main/SECURITY.md`} target="_blank" rel="noopener noreferrer" className="hover:text-[#a1a1a6]">{t('landing.footer.security')}</a>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t border-white/10">
            <span>{t('landing.footer.rights')}</span>
            <span>{VERSION} · {t('landing.footer.motto')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
