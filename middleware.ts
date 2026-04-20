import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Redirect to default locale when accessing root
  localePrefix: 'always',

  // Detect locale from Accept-Language header
  localeDetection: true
});

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /admin (Admin routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /images, /favicon.ico, etc. (static files)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
