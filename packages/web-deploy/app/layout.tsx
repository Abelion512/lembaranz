import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "Lembaranzzzz — Self-Hosted Credential Manager",
    template: "%s — Lembaranzzzz",
  },
  description: "Self-hosted, local-first, zero-knowledge credential manager running directly in your terminal.",
  keywords: ["credential manager", "password manager", "local-first", "CLI", "TUI", "AES-GCM", "Argon2id", "self-hosted", "zero-knowledge"],
  authors: [{ name: "Lembaranzzzz" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lembaranzzzz",
    "operatingSystem": "Linux, macOS, WSL",
    "applicationCategory": "SecurityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Self-hosted, local-first, zero-knowledge credential manager running directly in your terminal.",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} scroll-smooth dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const stored = localStorage.getItem('lembaranz-theme');
            if (stored === 'light') document.documentElement.classList.remove('dark');
            else if (stored === 'dark') document.documentElement.classList.add('dark');
            else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.remove('dark');
          })();
        `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <div className="flex-1">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
