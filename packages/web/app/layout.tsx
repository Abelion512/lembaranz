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
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html translate="no" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-black overflow-x-hidden`}>
                {children}
            </body>
        </html>
    );
}
