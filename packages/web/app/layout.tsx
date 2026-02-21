// Root layout — digunakan oleh Next.js sebagai entry point.
// Semua logika ada di app/[locale]/layout.tsx (locale-aware).
// Middleware akan redirect / ke /id/ atau /en/ otomatis.

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
