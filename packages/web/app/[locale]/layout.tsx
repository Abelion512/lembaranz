import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import { PengaturSuasana } from '@/komponen/bersama/PengaturSuasana';
import { Inter } from 'next/font/google';
import '@/gaya/Utama.css';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Lembaran',
    description: 'Brankas Aksara Personal yang Berdikari',
    icons: {
        icon: '/image.png',
        apple: '/image.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Lembaran',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <main className={`${inter.variable} font-sans bg-gray-50 dark:bg-black overflow-x-hidden min-h-screen w-full flex flex-col`}>
                <PengaturSuasana />
                <div className="flex-1 w-full min-w-0">
                    {children}
                </div>
            </main>
        </NextIntlClientProvider>
    );
}
