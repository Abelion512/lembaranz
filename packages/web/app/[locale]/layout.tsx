import { Inter } from 'next/font/google';
import '@/gaya/Utama.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      template: '%s | Lembaran',
      default: 'Lembaran'
    },
    description: t('description'),
    icons: {
      icon: '/image.png',
      apple: '/image.png',
    },
  };
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
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
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Ambil pesan terjemahan
    const messages = await getMessages();

    return (
        <html lang={locale} translate="no" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-black overflow-x-hidden`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
