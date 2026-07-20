import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Matcher for internationalized routes
  matcher: [
    // Redirect / to /hy
    '/',
    // Match only internationalized pathnames
    '/(hy|ru|en)/:path*'
  ]
};
