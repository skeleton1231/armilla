import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 照 next-intl 官方文档 matcher:排除 api/_next/静态资源
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
