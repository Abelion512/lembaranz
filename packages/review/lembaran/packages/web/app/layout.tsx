import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
    title: 'Lembaran Vault — Local GUI',
    description: 'Local vault management interface. Runs on localhost only — DO NOT deploy publicly.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a0a0a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className={inter.variable}>
            <body className="antialiased bg-zinc-950 text-white">{children}</body>
        </html>
    );
}
