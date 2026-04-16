import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lembaran — Self-Hosted Credential Manager",
    template: "%s — Lembaran",
  },
  description: "Self-hosted, local-first, zero-knowledge credential manager.",
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} scroll-smooth dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const stored = localStorage.getItem('lembaran-theme');
            if (stored === 'light') document.documentElement.classList.remove('dark');
            else if (stored === 'dark') document.documentElement.classList.add('dark');
            else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.remove('dark');
          })();
        `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
