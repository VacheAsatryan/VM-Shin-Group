import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // Supported locales
  locales: ['hy', 'ru', 'en'],
  // Armenian is default
  defaultLocale: 'hy',
  // Always include locale prefix in URL paths
  localePrefix: 'always',
  // Disable browser locale detection to force default or specific URL locale
  localeDetection: false
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
