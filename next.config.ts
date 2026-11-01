import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 同盘之日索引为运行时 fs 读取,需随独立部署分发
  outputFileTracingIncludes: {
    '/[locale]/chart': ['./data/same-structure.json'],
  },
  // 数据集 22GB 分片绝不让 build/tracing 扫读;部署时单独上传/拷贝(R2 或 standalone 后手工放置)
  outputFileTracingExcludes: {
    '/[locale]/chart': ['./data/dataset/**'],
    '/api/**': ['./data/dataset/**'],
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
