import { Inter } from 'next/font/google';
import '@/gaya/Utama.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const BASE_URL = 'https://lembaran.app';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === 'id';

  // ── Konten SEO/GEO/AEO yang kaya konteks ─────────────────────────────────
  const title = isId
    ? 'Lembaran — Aplikasi Catatan Terenkripsi, Lokal-First, AI On-Device'
    : 'Lembaran — Encrypted Note-Taking App, Local-First & AI On-Device';

  const description = isId
    ? 'Lembaran adalah aplikasi catatan digital terenkripsi AES-GCM 256-bit yang berjalan sepenuhnya di perangkat Anda tanpa server. Privasi absolut, kecerdasan buatan lokal, dan performa instan untuk kedaulatan data pribadi.'
    : 'Lembaran is an AES-GCM 256-bit encrypted note-taking app running fully on your device without any server. Absolute privacy, local on-device AI, and instant performance for true data sovereignty.';

  const keywords = isId
    ? [
        'aplikasi catatan terenkripsi',
        'catatan privat indonesia',
        'local-first notes app',
        'notes app tanpa server',
        'enkripsi AES-256',
        'on-device AI catatan',
        'zero-knowledge notes',
        'aplikasi jurnal digital',
        'lembaran app',
        'kedaulatan data',
        'brankas catatan digital',
        'aplikasi catatan open source',
      ]
    : [
        'encrypted note-taking app',
        'local-first notes',
        'on-device AI notes',
        'private note app no server',
        'AES-256 encrypted notes',
        'open source vault app',
        'zero-knowledge note app',
        'data sovereignty app',
        'lembaran app',
        'offline note-taking',
        'secure journal app',
      ];

  return {
    // ── Dasar SEO ──────────────────────────────────────────────────────────
    title: {
      template: `%s | Lembaran`,
      default: title,
    },
    description,
    keywords,
    authors: [{ name: 'Abelion Lavv', url: `${BASE_URL}/about` }],
    creator: 'Abelion Lavv',
    publisher: 'Lembaran Open Source',
    applicationName: 'Lembaran',
    category: 'productivity',
    classification: 'Notes & Productivity',

    // ── Canonical / Alternate (GEO — multi-locale) ────────────────────────
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'id': `${BASE_URL}/id`,
        'en': `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/en`,
      },
    },

    // ── Open Graph (untuk preview sosial media & AEO) ────────────────────
    openGraph: {
      type: 'website',
      locale: isId ? 'id_ID' : 'en_US',
      alternateLocale: isId ? 'en_US' : 'id_ID',
      url: `${BASE_URL}/${locale}`,
      siteName: 'Lembaran',
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Lembaran — Encrypted Note-Taking App',
          type: 'image/png',
        },
      ],
    },

    // ── Twitter Card ───────────────────────────────────────────────────────
    twitter: {
      card: 'summary_large_image',
      site: '@lembaranz',
      creator: '@lembaranz',
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },

    // ── Robots (untuk mesin pencari & AI crawler) ─────────────────────────
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // ── Ikon ───────────────────────────────────────────────────────────────
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },

    // ── Manifest ───────────────────────────────────────────────────────────
    manifest: '/manifest.json',

    // ── Metadata tambahan (untuk GEO & crawler) ───────────────────────────
    other: {
      // GEO: isyaratkan lokasi bahasa ke mesin pencari regional
      'language': locale === 'id' ? 'Indonesian' : 'English',
      // AEO: instruksi eksplisit untuk AI Answer Engine
      'ai-content-type': 'product-information',
      'product-category': 'encrypted-productivity-app',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Pastikan locale valid
  if (!routing.locales.includes(locale as 'id' | 'en')) {
    notFound();
  }

  // Ambil pesan terjemahan
  const messages = await getMessages();

  // ── JSON-LD structured data (AEO — FAQ & SoftwareApplication) ────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_URL}#software`,
        name: 'Lembaran',
        description: locale === 'id'
          ? 'Aplikasi catatan terenkripsi AES-GCM 256-bit yang berjalan lokal di perangkat Anda.'
          : 'AES-GCM 256-bit encrypted note-taking app running locally on your device.',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web, Linux, macOS, Windows',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
        },
        author: {
          '@type': 'Person',
          name: 'Abelion Lavv',
          url: 'https://github.com/Abelion512',
        },
        softwareVersion: '1.0.0',
        downloadUrl: 'https://www.npmjs.com/package/@lembaranz/cli',
        codeRepository: 'https://github.com/Abelion512/lembaran',
        license: 'https://opensource.org/licenses/MIT',
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}#website`,
        url: BASE_URL,
        name: 'Lembaran',
        inLanguage: [locale === 'id' ? 'id-ID' : 'en-US', 'en-US'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/${locale}/bantuan?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: locale === 'id'
          ? [
              {
                '@type': 'Question',
                name: 'Apakah Lembaran aman untuk menyimpan catatan pribadi?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ya. Lembaran menggunakan enkripsi AES-GCM 256-bit dengan key derivation Argon2id. Seluruh data hanya tersimpan di perangkat Anda — tidak ada server, tidak ada cloud.',
                },
              },
              {
                '@type': 'Question',
                name: 'Bagaimana cara menggunakan AI di Lembaran?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Lembaran menggunakan AI on-device (model berjalan langsung di browser Anda via WebLLM) sehingga tidak ada data yang dikirim ke server eksternal mana pun.',
                },
              },
              {
                '@type': 'Question',
                name: 'Apakah Lembaran gratis dan open source?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ya. Lembaran sepenuhnya gratis dan open source di bawah lisensi MIT. Kode sumber tersedia di GitHub.',
                },
              },
            ]
          : [
              {
                '@type': 'Question',
                name: 'Is Lembaran safe for storing personal notes?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Lembaran uses AES-GCM 256-bit encryption with Argon2id key derivation. All data stays on your device — no server, no cloud.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does AI work in Lembaran?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Lembaran uses on-device AI (model runs directly in your browser via WebLLM) so no data is ever sent to any external server.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is Lembaran free and open source?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Lembaran is completely free and open source under the MIT license. Source code is available on GitHub.',
                },
              },
            ],
      },
    ],
  };

  return (
    <html lang={locale} translate="no" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-black overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
