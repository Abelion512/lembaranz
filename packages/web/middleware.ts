import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Cocokkan semua path kecuali:
    // - /api, /_next, /_vercel
    // - file statis (mengandung titik seperti favicon.ico, image.png)
    matcher: ['/', '/(id|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
