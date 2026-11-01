import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 显式白名单:根路径、无前缀的页面路径(交给 next-intl 做 locale 协商重定向)、两个语言树。
  // 静态路径(/favicon.ico 等)与未知路径绝不进 proxy/[locale]。
  matcher: [
    '/',
    '/zh', '/zh/:path*',
    '/en', '/en/:path*',
    '/chart/:path*', '/stars/:path*', '/palaces/:path*',
    '/famous', '/method',
  ],
};
